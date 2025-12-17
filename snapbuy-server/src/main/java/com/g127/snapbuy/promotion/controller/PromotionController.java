package com.g127.snapbuy.promotion.controller;

import com.g127.snapbuy.order.dto.response.DiscountInfoResponse;
import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.promotion.dto.request.BatchDiscountInfoRequest;
import com.g127.snapbuy.promotion.dto.request.PromotionCreateRequest;
import com.g127.snapbuy.promotion.dto.request.PromotionUpdateRequest;
import com.g127.snapbuy.promotion.dto.response.PromotionResponse;
import com.g127.snapbuy.promotion.service.PromotionService;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PromotionResponse> create(@Valid @RequestBody PromotionCreateRequest request) {
        ApiResponse<PromotionResponse> response = new ApiResponse<>();
        response.setResult(promotionService.create(request));
        response.setMessage("Tạo khuyến mãi thành công");
        return response;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PromotionResponse> update(@PathVariable UUID id,
                                                 @Valid @RequestBody PromotionUpdateRequest request) {
        ApiResponse<PromotionResponse> response = new ApiResponse<>();
        response.setResult(promotionService.update(id, request));
        response.setMessage("Cập nhật khuyến mãi thành công");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<PromotionResponse>> getAll() {
        try {
            ApiResponse<List<PromotionResponse>> response = new ApiResponse<>();
            response.setResult(promotionService.getAll());
            return response;
        } catch (Exception e) {
            // Log lỗi chi tiết để debug
            System.err.println("Error in PromotionController.getAll(): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PromotionResponse> getById(@PathVariable UUID id) {
        ApiResponse<PromotionResponse> response = new ApiResponse<>();
        response.setResult(promotionService.getById(id));
        return response;
    }
    @GetMapping("/product/{productId}/discount")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<BigDecimal> getBestDiscount(@PathVariable UUID productId, @RequestParam BigDecimal unitPrice) {
        ApiResponse<BigDecimal> response = new ApiResponse<>();
        response.setResult(promotionService.computeBestDiscountPercent(productId, unitPrice, LocalDateTime.now()));
        return response;
    }

    @GetMapping("/product/{productId}/discount-info")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<DiscountInfoResponse> getBestDiscountInfo(@PathVariable UUID productId, @RequestParam BigDecimal unitPrice) {
        ApiResponse<DiscountInfoResponse> response = new ApiResponse<>();
        response.setResult(promotionService.computeBestDiscountInfo(productId, unitPrice, LocalDateTime.now()));
        return response;
    }

    @PostMapping("/batch-discount-info")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<Map<String, DiscountInfoResponse>> getBatchDiscountInfo(
            @RequestBody BatchDiscountInfoRequest request) {
        List<UUID> productIds = request.getProducts().stream()
                .map(BatchDiscountInfoRequest.ProductPriceItem::getProductId)
                .toList();
        Map<UUID, BigDecimal> priceMap = request.getProducts().stream()
                .collect(java.util.stream.Collectors.toMap(
                        BatchDiscountInfoRequest.ProductPriceItem::getProductId,
                        BatchDiscountInfoRequest.ProductPriceItem::getUnitPrice,
                        (existing, replacement) -> existing
                ));
        Map<UUID, DiscountInfoResponse> resultMap = promotionService.computeBatchDiscountInfo(
                productIds, priceMap, LocalDateTime.now());
        // Convert UUID keys to String for JSON serialization
        Map<String, DiscountInfoResponse> stringKeyMap = resultMap.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        e -> e.getKey().toString(),
                        Map.Entry::getValue
                ));
        ApiResponse<Map<String, DiscountInfoResponse>> response = new ApiResponse<>();
        response.setResult(stringKeyMap);
        return response;
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PromotionResponse> toggleStatus(@PathVariable UUID id) {
        ApiResponse<PromotionResponse> response = new ApiResponse<>();
        response.setResult(promotionService.togglePromotionStatus(id));
        response.setMessage("Đã cập nhật trạng thái khuyến mãi thành công");
        return response;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        promotionService.delete(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Xóa khuyến mãi thành công");
        return response;
    }
}


