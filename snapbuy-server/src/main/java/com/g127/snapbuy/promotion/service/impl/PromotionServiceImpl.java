package com.g127.snapbuy.promotion.service.impl;

import com.g127.snapbuy.order.dto.response.DiscountInfoResponse;
import com.g127.snapbuy.promotion.dto.request.PromotionCreateRequest;
import com.g127.snapbuy.promotion.dto.request.PromotionUpdateRequest;
import com.g127.snapbuy.promotion.dto.response.PromotionResponse;
import com.g127.snapbuy.product.entity.Product;
import com.g127.snapbuy.promotion.entity.Promotion;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.promotion.mapper.PromotionMapper;
import com.g127.snapbuy.product.repository.ProductRepository;
import com.g127.snapbuy.promotion.repository.PromotionRepository;
import com.g127.snapbuy.notification.service.NotificationSchedulerService;
import com.g127.snapbuy.promotion.service.PromotionService;
import com.g127.snapbuy.tenant.context.TenantContext;
import com.g127.snapbuy.tenant.entity.Tenant;
import com.g127.snapbuy.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final PromotionMapper promotionMapper;
    private final NotificationSchedulerService notificationSchedulerService;
    private final TenantRepository tenantRepository;

    @Override
    @Transactional
    public PromotionResponse create(PromotionCreateRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }

        // Trim leading/trailing whitespace from promotion name
        String trimmedName = request.getPromotionName().trim();
        request.setPromotionName(trimmedName);

        // Check duplicate promotion name
        if (promotionRepository.existsByPromotionNameIgnoreCase(request.getPromotionName())) {
            throw new AppException(ErrorCode.NAME_EXISTED);
        }

        Promotion entity = promotionMapper.toEntity(request);
        entity.setActive(true);
        entity.setCreatedDate(LocalDateTime.now());

        Set<Product> products = resolveProducts(request.getProductIds());
        entity.setProducts(products);

        Promotion saved = promotionRepository.save(entity);

        // Schedule notifications for this promotion (real-time)
        notificationSchedulerService.schedulePromotionNotifications(saved.getPromotionId());

        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PromotionResponse update(UUID id, PromotionUpdateRequest request) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }

        // Check duplicate promotion name if name is being updated
        if (request.getPromotionName() != null && !request.getPromotionName().trim().isEmpty()) {
            // Trim leading/trailing whitespace from promotion name
            String trimmedName = request.getPromotionName().trim();
            request.setPromotionName(trimmedName);
            
            if (promotionRepository.existsByPromotionNameIgnoreCase(request.getPromotionName())
                    && !p.getPromotionName().equalsIgnoreCase(request.getPromotionName())) {
                throw new AppException(ErrorCode.NAME_EXISTED);
            }
        }

        promotionMapper.updateEntity(p, request);

        if (request.getProductIds() != null) {
            Set<Product> products = resolveProducts(request.getProductIds());
            p.setProducts(products);
        }

        Promotion saved = promotionRepository.save(p);

        // Reschedule notifications after update
        notificationSchedulerService.schedulePromotionNotifications(saved.getPromotionId());

        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getById(UUID id) {
        Promotion p = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        return promotionMapper.toResponse(p);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAll() {
        return promotionRepository.findAll().stream()
                .map(promotionMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deactivateExpired() {
        List<Promotion> expired = promotionRepository.findExpiredActive(LocalDateTime.now());
        for (Promotion p : expired) {
            p.setActive(false);
        }
        if (!expired.isEmpty()) {
            promotionRepository.saveAll(expired);
        }
    }

    @Override
    @Transactional
    public PromotionResponse togglePromotionStatus(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        Boolean currentActive = promotion.getActive();
        boolean newActive = currentActive == null || !currentActive;
        promotion.setActive(newActive);
        Promotion saved = promotionRepository.save(promotion);

        // Schedule or cancel notifications based on new status
        if (newActive) {
            notificationSchedulerService.schedulePromotionNotifications(saved.getPromotionId());
        } else {
            notificationSchedulerService.cancelPromotionNotifications(saved.getPromotionId());
        }

        return promotionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        // Cancel scheduled notifications before deleting
        notificationSchedulerService.cancelPromotionNotifications(id);

        promotionRepository.delete(promotion);
    }

    @Scheduled(cron = "0 0 * * * *")
    public void scheduledDeactivateExpired() {
        log.info("Starting scheduled deactivation of expired promotions for all tenants");
        
        // Lấy danh sách tất cả các tenant active
        List<Tenant> tenants = tenantRepository.findAll().stream()
                .filter(Tenant::getIsActive)
                .toList();
        
        for (Tenant tenant : tenants) {
            try {
                // Set tenant context cho mỗi tenant
                TenantContext.setCurrentTenant(tenant.getTenantCode());
                log.info("Processing expired promotions for tenant: {}", tenant.getTenantCode());
                
                // Thực hiện deactivate expired promotions
                deactivateExpired();
                
            } catch (Exception e) {
                log.error("Error processing expired promotions for tenant: {}", tenant.getTenantCode(), e);
            } finally {
                // Clear tenant context sau khi xử lý xong
                TenantContext.clear();
            }
        }
        
        log.info("Completed scheduled deactivation of expired promotions for all tenants");
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal computeBestDiscountPercent(UUID productId, BigDecimal unitPrice, LocalDateTime at) {
        List<Promotion> promos = promotionRepository.findActivePromotionsForProductAt(productId, at);
        if (promos.isEmpty()) return BigDecimal.ZERO;

        BigDecimal bestPercent = BigDecimal.ZERO;
        for (Promotion p : promos) {
            switch (p.getDiscountType()) {
                case PERCENT -> {
                    if (p.getDiscountValue() != null) {
                        BigDecimal pct = p.getDiscountValue();
                        if (pct.compareTo(bestPercent) > 0) bestPercent = pct;
                    }
                }
                case FIXED -> {
                    if (p.getDiscountValue() != null && unitPrice != null && unitPrice.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal pct = p.getDiscountValue()
                                .divide(unitPrice, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100));
                        if (pct.compareTo(bestPercent) > 0) bestPercent = pct;
                    }
                }
            }
        }
        if (bestPercent.compareTo(BigDecimal.valueOf(100)) > 0) return BigDecimal.valueOf(100);
        if (bestPercent.compareTo(BigDecimal.ZERO) < 0) return BigDecimal.ZERO;
        return bestPercent.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountInfoResponse computeBestDiscountInfo(UUID productId, BigDecimal unitPrice, LocalDateTime at) {
        List<Promotion> promos = promotionRepository.findActivePromotionsForProductAt(productId, at);
        if (promos.isEmpty()) {
            return DiscountInfoResponse.builder()
                    .discountType(null)
                    .discountValue(BigDecimal.ZERO)
                    .discountPercent(BigDecimal.ZERO)
                    .build();
        }

        // CỘNG TẤT CẢ các loại giảm giá lại
        BigDecimal totalDiscountAmount = BigDecimal.ZERO;

        for (Promotion p : promos) {
            BigDecimal discountAmount = BigDecimal.ZERO;
            switch (p.getDiscountType()) {
                case PERCENT -> {
                    if (p.getDiscountValue() != null && unitPrice != null) {
                        // Tính số tiền giảm từ phần trăm
                        discountAmount = unitPrice.multiply(p.getDiscountValue()).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                    }
                }
                case FIXED -> {
                    if (p.getDiscountValue() != null) {
                        // Số tiền giảm trực tiếp
                        discountAmount = p.getDiscountValue();
                    }
                }
            }
            // Cộng dồn tất cả các loại giảm giá
            totalDiscountAmount = totalDiscountAmount.add(discountAmount);
        }

        // Giới hạn tối đa không vượt quá giá gốc (tránh giá âm)
        if (unitPrice != null && totalDiscountAmount.compareTo(unitPrice) > 0) {
            totalDiscountAmount = unitPrice;
        }

        // Tính phần trăm tương đương để hiển thị
        BigDecimal discountPercent = BigDecimal.ZERO;
        if (unitPrice != null && unitPrice.compareTo(BigDecimal.ZERO) > 0) {
            discountPercent = totalDiscountAmount.divide(unitPrice, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            if (discountPercent.compareTo(BigDecimal.valueOf(100)) > 0) {
                discountPercent = BigDecimal.valueOf(100);
            }
        }

        return DiscountInfoResponse.builder()
                .discountType(null) // Không có loại cụ thể vì là tổng hợp
                .discountValue(totalDiscountAmount) // Tổng số tiền giảm
                .discountPercent(discountPercent.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    private Set<Product> resolveProducts(List<UUID> productIds) {
        Set<Product> products = new HashSet<>();
        for (UUID id : productIds) {
            Product prod = productRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            products.add(prod);
        }
        return products;
    }
}




