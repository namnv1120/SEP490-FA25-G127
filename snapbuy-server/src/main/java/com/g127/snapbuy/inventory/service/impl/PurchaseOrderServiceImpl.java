package com.g127.snapbuy.inventory.service.impl;

import com.g127.snapbuy.inventory.dto.request.PurchaseOrderApproveRequest;
import com.g127.snapbuy.inventory.dto.request.PurchaseOrderCreateRequest;
import com.g127.snapbuy.inventory.dto.request.PurchaseOrderEmailRequest;
import com.g127.snapbuy.inventory.dto.request.PurchaseOrderReceiveRequest;
import com.g127.snapbuy.inventory.dto.request.PurchaseOrderUpdateRequest;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.inventory.dto.response.PurchaseOrderResponse;
import com.g127.snapbuy.inventory.dto.response.PurchaseOrderDetailResponse;
import com.g127.snapbuy.inventory.entity.Inventory;
import com.g127.snapbuy.inventory.entity.InventoryTransaction;
import com.g127.snapbuy.inventory.entity.PurchaseOrder;
import com.g127.snapbuy.inventory.entity.PurchaseOrderDetail;
import com.g127.snapbuy.product.entity.Product;
import com.g127.snapbuy.product.entity.ProductPrice;
import com.g127.snapbuy.account.entity.Account;
import com.g127.snapbuy.supplier.entity.Supplier;
import com.g127.snapbuy.notification.entity.Notification.NotificationType;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.inventory.mapper.PurchaseOrderMapper;
import com.g127.snapbuy.inventory.repository.PurchaseOrderRepository;
import com.g127.snapbuy.inventory.repository.PurchaseOrderDetailRepository;
import com.g127.snapbuy.inventory.repository.InventoryRepository;
import com.g127.snapbuy.inventory.repository.InventoryTransactionRepository;
import com.g127.snapbuy.product.repository.ProductRepository;
import com.g127.snapbuy.product.repository.ProductPriceRepository;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.supplier.repository.SupplierRepository;
import com.g127.snapbuy.notification.service.NotificationService;
import com.g127.snapbuy.inventory.service.PurchaseOrderService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    @PersistenceContext(unitName = "tenant")
    private EntityManager entityManager;

    private final PurchaseOrderRepository purchaseOrderRepo;
    private final PurchaseOrderDetailRepository detailRepo;
    private final InventoryRepository inventoryRepo;
    private final InventoryTransactionRepository inventoryTxnRepo;
    private final ProductRepository productRepo;
    private final ProductPriceRepository productPriceRepo;
    private final AccountRepository accountRepo;
    private final SupplierRepository supplierRepo;
    private final PurchaseOrderMapper purchaseOrderMapper;
    private final com.g127.snapbuy.auth.service.MailService mailService;
    private final NotificationService notificationService;
    private final com.g127.snapbuy.notification.service.NotificationSettingsService notificationSettingsService;

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PurchaseOrderResponse create(PurchaseOrderCreateRequest req, String usernameOrEmail) {
        UUID currentAccountId = resolveAccountId(usernameOrEmail);

        supplierRepo.findById(req.getSupplierId())
                .orElseThrow(() -> new NoSuchElementException("Nhà cung cấp không tồn tại: " + req.getSupplierId()));

        for (var i : req.getItems()) {
            productRepo.findById(i.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại: " + i.getProductId()));
            if (i.getQuantity() <= 0) throw new IllegalArgumentException("Số lượng phải > 0");
        }

        LocalDateTime now = LocalDateTime.now();

        Map<UUID, BigDecimal> unitPriceByProduct = new HashMap<>();
        for (var i : req.getItems()) {
            var product = productRepo.findById(i.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại: " + i.getProductId()));
            if (i.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng phải > 0");
            }

            var invOpt = inventoryRepo.findByProduct_ProductId(i.getProductId());
            if (invOpt.isEmpty()) {
                throw new IllegalStateException("Sản phẩm chưa khai báo trong kho: " + product.getProductName());
            }
            var inv = invOpt.get();
            int current = Optional.ofNullable(inv.getQuantityInStock()).orElse(0);
            Integer maxStock = inv.getMaximumStock();
            if (maxStock != null && (long) current + i.getQuantity() > maxStock) {
                throw new IllegalStateException("Số lượng sau nhập vượt mức tối đa trong kho: " + product.getProductName());
            }

            // Sử dụng unitPrice từ request nếu có, nếu không thì lấy từ database
            BigDecimal price;
            if (i.getUnitPrice() != null && i.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
                // Sử dụng giá từ request (đã được chỉnh sửa)
                price = i.getUnitPrice();
            } else {
                // Lấy giá từ database nếu request không có giá
                price = productPriceRepo.findEffectivePrice(product.getProductId(), now)
                        .map(ProductPrice::getCostPrice)
                        .orElseThrow(() -> new IllegalStateException("Sản phẩm chưa có giá nhập hiệu lực: " + product.getProductName()));
                if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new IllegalStateException("Sản phẩm chưa có giá nhập hợp lệ: " + product.getProductName());
                }
            }
            unitPriceByProduct.put(product.getProductId(), price);
        }

        BigDecimal plannedSubtotal = req.getItems().stream()
                .map(i -> unitPriceByProduct.get(i.getProductId()).multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRatePct = Optional.ofNullable(req.getTaxAmount()).orElse(BigDecimal.ZERO);
        BigDecimal plannedTax = plannedSubtotal.multiply(taxRatePct)
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal plannedTotal = plannedSubtotal.add(plannedTax);

        PurchaseOrder po = PurchaseOrder.builder()
                .number(generateUniqueNumber())
                .supplierId(req.getSupplierId())
                .accountId(currentAccountId)
                .orderDate(now)
                .status("Chờ duyệt")
                .totalAmount(plannedTotal)
                .taxAmount(plannedTax)
                .notes(cleanNotes(req.getNotes()))
                .build();

        purchaseOrderRepo.save(po);
        purchaseOrderRepo.flush();

        UUID poId = po.getId();

        List<PurchaseOrderDetail> details = req.getItems().stream().map(i ->
                PurchaseOrderDetail.builder()
                        .purchaseOrderId(poId)
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .unitPrice(unitPriceByProduct.get(i.getProductId()))
                        .receivedQuantity(0)
                        .build()
        ).toList();

        detailRepo.saveAll(details);
        detailRepo.flush();

        // Thông báo cho Chủ cửa hàng: Có đơn đặt hàng mới cần duyệt
        notifyShopOwnersNewPurchaseOrder(po, currentAccountId);

        return mapResponse(po, details);
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PurchaseOrderResponse approve(UUID poId, PurchaseOrderApproveRequest req, String usernameOrEmail) {
        resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));

        if ("Đã hủy".equals(po.getStatus())) throw new IllegalStateException("Phiếu đã hủy, không thể duyệt");
        if ("Đã nhận hàng".equals(po.getStatus())) throw new IllegalStateException("Phiếu đã hoàn tất, không thể duyệt");
        if (!"Chờ duyệt".equals(po.getStatus())) throw new IllegalStateException("Chỉ duyệt phiếu ở trạng thái 'Chờ duyệt'");

        if (req.getOwnerAccountId() != null) {
            accountRepo.findById(req.getOwnerAccountId())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản chủ cửa hàng"));
        }

        String base = "Phiếu đã được duyệt.";
        String extra = (req.getNotes() != null && !req.getNotes().isBlank()) ? (" " + cleanNotes(req.getNotes())) : "";
        po.setStatus("Đã duyệt");
        po.setNotes(base + extra);
        purchaseOrderRepo.save(po);

        // Thông báo cho nhân viên tạo đơn: Đơn đã được duyệt
        notifyStaffOrderApproved(po);

        List<PurchaseOrderDetail> details = detailRepo.findByPurchaseOrderId(poId);
        return mapResponse(po, details);
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PurchaseOrderResponse receive(UUID poId, PurchaseOrderReceiveRequest req, String usernameOrEmail) {
        UUID receiverId = resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));

        if (!"Chờ xác nhận".equals(po.getStatus())) {
            if ("Đã hủy".equals(po.getStatus())) throw new IllegalStateException("Phiếu đã hủy, không thể xác nhận.");
            if ("Đã nhận hàng".equals(po.getStatus())) throw new IllegalStateException("Phiếu đã hoàn tất, không thể chỉnh sửa.");
            if ("Đã duyệt".equals(po.getStatus())) throw new IllegalStateException("Phiếu chưa cập nhật số lượng thực nhận. Vui lòng cập nhật số lượng thực nhận trước.");
            throw new IllegalStateException("Chỉ có thể xác nhận nhận hàng từ trạng thái 'Chờ xác nhận'. Trạng thái hiện tại: " + po.getStatus());
        }

        List<PurchaseOrderDetail> details = detailRepo.findAllForUpdateByPurchaseOrderId(poId);
        
        // Cho phép receiveQuantity = 0 (nhà cung cấp không còn hàng), nhưng phải có giá trị (không null)
        boolean allHaveReceivedQuantity = details.stream()
                .allMatch(d -> d.getReceivedQuantity() != null);
        
        if (!allHaveReceivedQuantity) {
            throw new IllegalStateException("Phải cập nhật số lượng thực nhận cho tất cả sản phẩm trước khi nhận hàng");
        }
        
        Map<UUID, PurchaseOrderDetail> byId = details.stream()
                .collect(Collectors.toMap(PurchaseOrderDetail::getId, d -> d));

        // Nếu có request items, sử dụng giá trị từ request
        // Nếu không, giữ nguyên receivedQuantity đã có (có thể = 0)
        if (req.getItems() != null && !req.getItems().isEmpty()) {
            for (var it : req.getItems()) {
                if (it.getReceivedQuantity() < 0) throw new IllegalArgumentException("Số lượng nhận phải ≥ 0");
                var d = Optional.ofNullable(byId.get(it.getPurchaseOrderDetailId()))
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy dòng chi tiết: " + it.getPurchaseOrderDetailId()));
                int planned = Optional.ofNullable(d.getQuantity()).orElse(0);
                int receivedSoFar = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
                int newReceivedQty = it.getReceivedQuantity();
                // Kiểm tra số lượng mới không vượt quá số lượng kế hoạch
                if (newReceivedQty > planned) throw new IllegalStateException("Số lượng nhận vượt kế hoạch");
                d.setReceivedQuantity(newReceivedQty);
            }
        }
        // Nếu không có request items, giữ nguyên receivedQuantity đã có (đã được cập nhật trước đó)
        detailRepo.saveAll(details);
        detailRepo.flush();

        LocalDateTime now = LocalDateTime.now();
        var account = accountRepo.findById(receiverId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + receiverId));

        // Nhập kho cho tất cả sản phẩm, kể cả khi số lượng thực nhận = 0
        Map<UUID, Integer> importByProduct = new HashMap<>();
        Map<UUID, BigDecimal> unitPriceByProduct = new HashMap<>();
        for (PurchaseOrderDetail d : details) {
            int receivedQty = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
            UUID productId = d.getProductId();
            // Cho phép nhập kho ngay cả khi số lượng = 0
            importByProduct.merge(productId, receivedQty, Integer::sum);
            unitPriceByProduct.putIfAbsent(productId,
                    Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO));
        }

        for (var e : importByProduct.entrySet()) {
            UUID productId = e.getKey();
            int qty = e.getValue();

            var product = productRepo.findById(productId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm: " + productId));

            var invOpt = inventoryRepo.lockByProductId(productId);
            Inventory inv = invOpt.orElseThrow(() ->
                    new IllegalStateException("Kho không hợp lệ cho sản phẩm: " + product.getProductName()));

            // Nhập kho (có thể là 0 nếu số lượng thực nhận = 0)
            inv.setQuantityInStock(inv.getQuantityInStock() + qty);
            inv.setLastUpdated(now);
            inventoryRepo.saveAndFlush(inv);

            InventoryTransaction txn = InventoryTransaction.builder()
                    .product(product)
                    .account(account)
                    .transactionType("Nhập kho")
                    .quantity(qty)
                    .unitPrice(unitPriceByProduct.getOrDefault(productId, BigDecimal.ZERO))
                    .referenceType("Phiếu nhập hàng")
                    .referenceId(po.getId())
                    .notes(cleanNotes(req.getNotes()))
                    .transactionDate(now)
                    .build();
            inventoryTxnRepo.save(txn);
        }

        BigDecimal receivedSubtotal = details.stream()
                .map(d -> Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO)
                        .multiply(BigDecimal.valueOf(Optional.ofNullable(d.getReceivedQuantity()).orElse(0))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal plannedSubtotal = details.stream()
                .map(d -> Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO)
                        .multiply(BigDecimal.valueOf(Optional.ofNullable(d.getQuantity()).orElse(0))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRatePct = BigDecimal.ZERO;
        if (plannedSubtotal.compareTo(BigDecimal.ZERO) > 0) {
            taxRatePct = Optional.ofNullable(po.getTaxAmount()).orElse(BigDecimal.ZERO)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(plannedSubtotal, 6, java.math.RoundingMode.HALF_UP);
        }
        // Tính thuế: nếu receivedSubtotal = 0 thì taxAmount = 0 (tránh lỗi khi số lượng thực nhận = 0)
        BigDecimal taxAmount = BigDecimal.ZERO;
        if (receivedSubtotal.compareTo(BigDecimal.ZERO) > 0) {
            taxAmount = receivedSubtotal.multiply(taxRatePct)
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        }
        BigDecimal receivedTotal = receivedSubtotal.add(taxAmount);

        po.setTaxAmount(taxAmount);
        po.setTotalAmount(receivedTotal);
        po.setStatus("Đã nhận hàng");
        po.setReceivedDate(LocalDateTime.now());
        purchaseOrderRepo.save(po);

        // Cập nhật cost_price trong ProductPrice với giá từ đơn hàng
        // Group theo productId để tránh update nhiều lần cho cùng một sản phẩm
        // Cho phép cập nhật cost_price ngay cả khi số lượng thực nhận = 0 (nhà cung cấp hết hàng)
        Map<UUID, BigDecimal> costPriceByProduct = new HashMap<>();
        for (PurchaseOrderDetail detail : details) {
            if (detail.getReceivedQuantity() != null) {
                UUID productId = detail.getProductId();
                BigDecimal newCostPrice = Optional.ofNullable(detail.getUnitPrice()).orElse(BigDecimal.ZERO);
                if (newCostPrice.compareTo(BigDecimal.ZERO) > 0) {
                    // Lấy giá cuối cùng nếu có nhiều detail cùng sản phẩm
                    costPriceByProduct.put(productId, newCostPrice);
                }
            }
        }
        
        // Update costPrice cho từng sản phẩm
        for (Map.Entry<UUID, BigDecimal> entry : costPriceByProduct.entrySet()) {
            UUID productId = entry.getKey();
            BigDecimal newCostPrice = entry.getValue();
            
            Optional<ProductPrice> currentPriceOpt = productPriceRepo.findCurrentPriceByProductId(productId);
            if (currentPriceOpt.isPresent()) {
                ProductPrice currentPrice = currentPriceOpt.get();
                // Cập nhật costPrice của giá hiện tại, giữ nguyên unitPrice
                currentPrice.setCostPrice(newCostPrice);
                productPriceRepo.save(currentPrice);
            } else {
                // Nếu không có giá hiện tại, tạo mới với unitPrice = costPrice
                Product product = productRepo.findById(productId)
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm: " + productId));
                ProductPrice newPrice = ProductPrice.builder()
                        .product(product)
                        .unitPrice(newCostPrice) // Nếu chưa có giá, set unitPrice = costPrice
                        .costPrice(newCostPrice)
                        .validFrom(now)
                        .createdDate(now)
                        .build();
                productPriceRepo.save(newPrice);
            }
        }

        return mapResponse(po, details);
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PurchaseOrderResponse cancel(UUID poId, String usernameOrEmail) {
        UUID cancellerAccountId = resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));
        if ("Đã nhận hàng".equals(po.getStatus())) throw new IllegalStateException("Không thể hủy phiếu đã hoàn tất");
        if ("Chờ xác nhận".equals(po.getStatus())) throw new IllegalStateException("Không thể hủy phiếu đang chờ xác nhận. Vui lòng quay lại trạng thái đã duyệt trước.");

        List<PurchaseOrderDetail> details = detailRepo.findAllForUpdateByPurchaseOrderId(poId);
        for (PurchaseOrderDetail d : details) d.setReceivedQuantity(0);
        detailRepo.saveAll(details);
        detailRepo.flush();

        po.setTaxAmount(BigDecimal.ZERO);
        po.setTotalAmount(BigDecimal.ZERO);
        po.setStatus("Đã hủy");
        po.setReceivedDate(null);
        purchaseOrderRepo.save(po);

        // Thông báo cho nhân viên tạo đơn: Đơn đã bị hủy
        notifyStaffOrderCancelled(po, cancellerAccountId);

        return mapResponse(po, details);
    }


    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public List<PurchaseOrderResponse> findAll() {
        List<PurchaseOrder> pos = purchaseOrderRepo.findAll();
        Map<UUID, List<PurchaseOrderDetail>> detailsByPo = detailRepo.findByPurchaseOrderIdIn(
                pos.stream().map(PurchaseOrder::getId).toList()
        ).stream().collect(Collectors.groupingBy(PurchaseOrderDetail::getPurchaseOrderId));
        return pos.stream()
                .map(po -> mapResponse(po, detailsByPo.getOrDefault(po.getId(), List.of())))
                .toList();
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PageResponse<PurchaseOrderResponse> search(String status, UUID supplierId, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Page<PurchaseOrder> page;
        if (supplierId != null) {
            page = purchaseOrderRepo.findBySupplierId(supplierId, pageable);
        } else if (status != null && !status.isBlank()) {
            page = purchaseOrderRepo.findByStatusContainingIgnoreCase(status.trim(), pageable);
        } else if (from != null && to != null) {
            page = purchaseOrderRepo.findByOrderDateBetween(from, to, pageable);
        } else {
            page = purchaseOrderRepo.findAll(pageable);
        }

        List<UUID> poIds = page.getContent().stream().map(PurchaseOrder::getId).toList();
        Map<UUID, List<PurchaseOrderDetail>> detailsByPo = poIds.isEmpty()
                ? Map.of()
                : detailRepo.findByPurchaseOrderIdIn(poIds).stream()
                .collect(Collectors.groupingBy(PurchaseOrderDetail::getPurchaseOrderId));

        Set<UUID> supplierIds = page.getContent().stream().map(PurchaseOrder::getSupplierId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Supplier> supplierMap = supplierIds.isEmpty() ? Map.of()
                : supplierRepo.findAllById(supplierIds).stream().collect(Collectors.toMap(Supplier::getSupplierId, s -> s));

        Set<UUID> accountIds = page.getContent().stream().map(PurchaseOrder::getAccountId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Account> accountMap = accountIds.isEmpty() ? Map.of()
                : accountRepo.findAllById(accountIds).stream().collect(Collectors.toMap(Account::getAccountId, a -> a));

        List<PurchaseOrderResponse> responseContent = page.getContent().stream()
                .map(po -> purchaseOrderMapper.toResponse(
                        po,
                        detailsByPo.getOrDefault(po.getId(), List.of()),
                        supplierMap.getOrDefault(po.getSupplierId(), null),
                        accountMap.getOrDefault(po.getAccountId(), null)
                ))
                .toList();

        return PageResponse.<PurchaseOrderResponse>builder()
                .content(responseContent)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .size(page.getSize())
                .number(page.getNumber())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PageResponse<PurchaseOrderResponse> searchByKeyword(String keyword, String status, LocalDateTime orderDateFrom, LocalDateTime orderDateTo, LocalDateTime receivedDateFrom, LocalDateTime receivedDateTo, Pageable pageable) {
        try {
            
            String orderByClause = buildOrderByClause(pageable.getSort());
        
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();
        boolean hasOrderDateFrom = orderDateFrom != null;
        boolean hasOrderDateTo = orderDateTo != null;
        boolean hasReceivedDateFrom = receivedDateFrom != null;
        boolean hasReceivedDateTo = receivedDateTo != null;
        
        List<String> conditions = new ArrayList<>();
        if (hasKeyword) {
            conditions.add("(LOWER(po.purchase_order_number) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(s.supplier_name) LIKE LOWER(CONCAT('%', :keyword, '%')))");
        }
        if (hasStatus) {
            conditions.add("LOWER(po.status) = LOWER(:status)");
        }
        if (hasOrderDateFrom) {
            conditions.add("po.order_date >= :orderDateFrom");
        }
        if (hasOrderDateTo) {
            conditions.add("po.order_date <= :orderDateTo");
        }
        if (hasReceivedDateFrom) {
            conditions.add("po.received_date >= :receivedDateFrom");
        }
        if (hasReceivedDateTo) {
            conditions.add("po.received_date <= :receivedDateTo");
        }
        
        String whereClause = conditions.isEmpty() 
                ? "" 
                : "WHERE " + String.join(" AND ", conditions);
        
        String baseQuery = "SELECT po.* FROM dbo.purchase_order po " +
                "LEFT JOIN dbo.suppliers s ON po.supplier_id = s.supplier_id " +
                "LEFT JOIN dbo.accounts a ON po.account_id = a.account_id " +
                whereClause + " " +
                "ORDER BY " + orderByClause;
        
        String countQuery = "SELECT COUNT(po.purchase_order_id) FROM dbo.purchase_order po " +
                "LEFT JOIN dbo.suppliers s ON po.supplier_id = s.supplier_id " +
                "LEFT JOIN dbo.accounts a ON po.account_id = a.account_id " +
                whereClause;
        
        Query countQ = entityManager.createNativeQuery(countQuery);
        if (hasKeyword) {
            countQ.setParameter("keyword", keyword.trim());
        }
        if (hasStatus) {
            countQ.setParameter("status", status.trim());
        }
        if (hasOrderDateFrom) {
            countQ.setParameter("orderDateFrom", orderDateFrom);
        }
        if (hasOrderDateTo) {
            countQ.setParameter("orderDateTo", orderDateTo);
        }
        if (hasReceivedDateFrom) {
            countQ.setParameter("receivedDateFrom", receivedDateFrom);
        }
        if (hasReceivedDateTo) {
            countQ.setParameter("receivedDateTo", receivedDateTo);
        }
        Long totalCount = ((Number) countQ.getSingleResult()).longValue();
        
        Query dataQ = entityManager.createNativeQuery(baseQuery, PurchaseOrder.class);
        if (hasKeyword) {
            dataQ.setParameter("keyword", keyword.trim());
        }
        if (hasStatus) {
            dataQ.setParameter("status", status.trim());
        }
        if (hasOrderDateFrom) {
            dataQ.setParameter("orderDateFrom", orderDateFrom);
        }
        if (hasOrderDateTo) {
            dataQ.setParameter("orderDateTo", orderDateTo);
        }
        if (hasReceivedDateFrom) {
            dataQ.setParameter("receivedDateFrom", receivedDateFrom);
        }
        if (hasReceivedDateTo) {
            dataQ.setParameter("receivedDateTo", receivedDateTo);
        }
        dataQ.setFirstResult((int) pageable.getOffset());
        dataQ.setMaxResults(pageable.getPageSize());
        
        @SuppressWarnings("unchecked")
        List<PurchaseOrder> content = dataQ.getResultList();
        
        List<UUID> poIds = content.stream().map(PurchaseOrder::getId).toList();
        Map<UUID, List<PurchaseOrderDetail>> detailsByPo = poIds.isEmpty()
                ? Map.of()
                : detailRepo.findByPurchaseOrderIdIn(poIds).stream()
                .collect(Collectors.groupingBy(PurchaseOrderDetail::getPurchaseOrderId));

        Set<UUID> supplierIds = content.stream().map(PurchaseOrder::getSupplierId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Supplier> supplierMap = supplierIds.isEmpty() ? Map.of()
                : supplierRepo.findAllById(supplierIds).stream().collect(Collectors.toMap(Supplier::getSupplierId, s -> s));

        Set<UUID> accountIds = content.stream().map(PurchaseOrder::getAccountId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<UUID, Account> accountMap = accountIds.isEmpty() ? Map.of()
                : accountRepo.findAllById(accountIds).stream().collect(Collectors.toMap(Account::getAccountId, a -> a));

        List<PurchaseOrderResponse> responseContent = content.stream()
                .map(po -> purchaseOrderMapper.toResponse(
                        po,
                        detailsByPo.getOrDefault(po.getId(), List.of()),
                        supplierMap.getOrDefault(po.getSupplierId(), null),
                        accountMap.getOrDefault(po.getAccountId(), null)
                ))
                .toList();
        
        return PageResponse.<PurchaseOrderResponse>builder()
                .content(responseContent)
                .totalElements(totalCount)
                .totalPages((int) Math.ceil((double) totalCount / pageable.getPageSize()))
                .size(pageable.getPageSize())
                .number(pageable.getPageNumber())
                .first(pageable.getPageNumber() == 0)
                .last(pageable.getPageNumber() >= (totalCount - 1) / pageable.getPageSize())
                .empty(responseContent.isEmpty())
                .build();
        } catch (Exception e) {
            log.error("Error searching purchase orders: keyword={}, status={}", keyword, status, e);
            throw e;
        }
    }
    
    private String mapFieldToColumn(String fieldName) {
        if (fieldName == null || fieldName.isEmpty()) {
            return "po.order_date";
        }
        
        return switch (fieldName) {
            case "orderDate" -> "po.order_date";
            case "receivedDate" -> "po.received_date";
            case "totalAmount" -> "po.total_amount";
            case "purchaseOrderNumber" -> "po.purchase_order_number";
            case "status" -> "po.status";
            case "supplierName" -> "s.supplier_name";
            case "fullName" -> "a.full_name";
            default -> {
                String snakeCase = fieldName.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
                yield "po." + snakeCase;
            }
        };
    }
    
    private String buildOrderByClause(Sort sort) {
        if (sort == null || !sort.iterator().hasNext()) {
            return "po.order_date DESC";
        }
        
        Sort.Order order = sort.iterator().next();
        String columnName = mapFieldToColumn(order.getProperty());
        String direction = order.getDirection() == Sort.Direction.ASC ? "ASC" : "DESC";
        
        return columnName + " " + direction;
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public void deletePurchaseOrder(UUID poId) {
        PurchaseOrder purchaseOrder = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new AppException(ErrorCode.PURCHASE_ORDER_NOT_FOUND));

        try {
            detailRepo.deleteAllByPurchaseOrderId(poId);
            detailRepo.flush();
            purchaseOrderRepo.delete(purchaseOrder);
            purchaseOrderRepo.flush();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xoá phiếu nhập hàng: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PurchaseOrderResponse getPurchaseOrderById(UUID poId) {
        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng với ID: " + poId));

        List<PurchaseOrderDetail> details = detailRepo.findByPurchaseOrderId(poId);

        Set<UUID> productIds = details.stream()
                .map(PurchaseOrderDetail::getProductId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, Product> productMap = productIds.isEmpty() ? Map.of() :
                productRepo.findAllById(productIds).stream()
                        .collect(Collectors.toMap(Product::getProductId, p -> p));

        List<PurchaseOrderDetailResponse> detailResponses = details.stream().map(detail -> {
            Product product = productMap.get(detail.getProductId());
            return mapDetailResponse(detail, product);
        }).toList();

        Supplier supplier = po.getSupplierId() != null ? supplierRepo.findById(po.getSupplierId()).orElse(null) : null;
        Account account = po.getAccountId() != null ? accountRepo.findById(po.getAccountId()).orElse(null) : null;

        return purchaseOrderMapper.toResponseWithDetails(po, detailResponses, supplier, account);
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PurchaseOrderResponse update(UUID poId, PurchaseOrderUpdateRequest req, String usernameOrEmail) {
        resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng với ID: " + poId));

        String status = po.getStatus();
        if ("Đã nhận hàng".equals(status)) {
            throw new IllegalStateException("Không thể chỉnh sửa đơn hàng đã hoàn tất. Trạng thái hiện tại: " + status);
        }
        if ("Đã hủy".equals(status)) {
            throw new IllegalStateException("Không thể chỉnh sửa đơn hàng đã bị hủy. Trạng thái hiện tại: " + status);
        }

        boolean isApproved = "Đã duyệt".equals(status);
        boolean isWaitingConfirmation = "Chờ xác nhận".equals(status);
        
        // Không cho phép chỉnh sửa khi ở trạng thái Chờ xác nhận
        if (isWaitingConfirmation) {
            throw new IllegalStateException("Không thể chỉnh sửa đơn hàng đang chờ xác nhận. Vui lòng xác nhận hoặc quay lại trạng thái đã duyệt.");
        }

        for (var i : req.getItems()) {
            productRepo.findById(i.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại: " + i.getProductId()));
            if (i.getQuantity() <= 0) throw new IllegalArgumentException("Số lượng phải > 0");
            if (i.getUnitPrice() == null || i.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0)
                throw new IllegalArgumentException("Đơn giá phải > 0");
            
            if (isApproved && i.getReceiveQuantity() != null) {
                if (i.getReceiveQuantity() < 0) {
                    throw new IllegalArgumentException("Số lượng thực nhận phải >= 0");
                }
                if (i.getReceiveQuantity() > i.getQuantity()) {
                    throw new IllegalArgumentException("Số lượng thực nhận không được vượt quá số lượng ban đầu");
                }
            }
        }
        
        // Kiểm tra xem có receiveQuantity được cập nhật không (kể cả 0)
        // Nếu đang ở trạng thái "Đã duyệt" và có receiveQuantity (kể cả 0), sẽ chuyển sang "Chờ xác nhận"
        boolean hasReceivedQuantity = isApproved && req.getItems().stream()
                .anyMatch(i -> i.getReceiveQuantity() != null);

        BigDecimal newSubtotal;
        if (isApproved) {
            newSubtotal = req.getItems().stream()
                    .map(i -> {
                        int qty = (i.getReceiveQuantity() != null) ? i.getReceiveQuantity() : 0;
                        return i.getUnitPrice().multiply(BigDecimal.valueOf(qty));
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } else {
            newSubtotal = req.getItems().stream()
                    .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal taxRatePct = Optional.ofNullable(req.getTaxAmount()).orElse(BigDecimal.ZERO);
        BigDecimal newTax = newSubtotal.multiply(taxRatePct)
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal newTotal = newSubtotal.add(newTax);

        po.setTotalAmount(newTotal);
        po.setTaxAmount(newTax);
        po.setNotes(cleanNotes(req.getNotes()));
        
        // Nếu đang ở trạng thái "Đã duyệt" và có receiveQuantity được cập nhật (kể cả 0), chuyển sang "Chờ xác nhận"
        // Vì có thể nhà cung cấp hết sản phẩm (nhận 0)
        boolean statusChangedToWaitingConfirm = false;
        if (isApproved && hasReceivedQuantity) {
            po.setStatus("Chờ xác nhận");
            statusChangedToWaitingConfirm = true;
        }

        purchaseOrderRepo.save(po);
        purchaseOrderRepo.flush();

        detailRepo.deleteAllByPurchaseOrderId(poId);
        detailRepo.flush();

        List<PurchaseOrderDetail> newDetails = req.getItems().stream().map(i -> {
                    int receivedQty = 0;
                    if (isApproved && i.getReceiveQuantity() != null) {
                        receivedQty = i.getReceiveQuantity();
                    }

                    return PurchaseOrderDetail.builder()
                            .purchaseOrderId(poId)
                            .productId(i.getProductId())
                            .quantity(i.getQuantity())
                            .unitPrice(i.getUnitPrice())
                            .receivedQuantity(receivedQty)
                            .build();
                }
        ).toList();

        detailRepo.saveAll(newDetails);
        detailRepo.flush();

        // Thông báo cho Chủ cửa hàng: Nhân viên đã cập nhật số lượng thực nhận
        if (statusChangedToWaitingConfirm) {
            notifyShopOwnersReceivedQuantityUpdated(po, usernameOrEmail);
        }

        return mapResponse(po, newDetails);
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PurchaseOrderResponse confirm(UUID poId, PurchaseOrderReceiveRequest req, String usernameOrEmail) {
        UUID receiverId = resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));

        if (!"Chờ xác nhận".equals(po.getStatus())) {
            if ("Đã hủy".equals(po.getStatus())) throw new IllegalStateException("Phiếu đã hủy, không thể xác nhận.");
            if ("Đã nhận hàng".equals(po.getStatus())) throw new IllegalStateException("Phiếu đã hoàn tất.");
            throw new IllegalStateException("Chỉ có thể xác nhận nhận hàng từ trạng thái 'Chờ xác nhận'. Trạng thái hiện tại: " + po.getStatus());
        }

        List<PurchaseOrderDetail> details = detailRepo.findAllForUpdateByPurchaseOrderId(poId);
        
        // Cho phép receiveQuantity = 0 (nhà cung cấp không còn hàng), nhưng phải có giá trị (không null)
        boolean allHaveReceivedQuantity = details.stream()
                .allMatch(d -> d.getReceivedQuantity() != null);
        
        if (!allHaveReceivedQuantity) {
            throw new IllegalStateException("Phải cập nhật số lượng thực nhận cho tất cả sản phẩm trước khi xác nhận nhận hàng");
        }

        LocalDateTime now = LocalDateTime.now();
        var account = accountRepo.findById(receiverId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + receiverId));

        // Cập nhật số lượng vào kho dựa trên receivedQuantity đã có
        // Cho phép nhập kho ngay cả khi số lượng thực nhận = 0
        Map<UUID, PurchaseOrderDetail> byId = details.stream()
                .collect(Collectors.toMap(PurchaseOrderDetail::getId, d -> d));

        Map<UUID, Integer> importByProduct = new HashMap<>();
        Map<UUID, BigDecimal> unitPriceByProduct = new HashMap<>();
        for (PurchaseOrderDetail d : details) {
            int receivedQty = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
            UUID productId = d.getProductId();
            // Cho phép nhập kho ngay cả khi số lượng = 0
            importByProduct.merge(productId, receivedQty, Integer::sum);
            unitPriceByProduct.putIfAbsent(productId,
                    Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO));
        }

        for (var e : importByProduct.entrySet()) {
            UUID productId = e.getKey();
            int qty = e.getValue();

            var product = productRepo.findById(productId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm: " + productId));

            var invOpt = inventoryRepo.lockByProductId(productId);
            Inventory inv = invOpt.orElseThrow(() ->
                    new IllegalStateException("Kho không hợp lệ cho sản phẩm: " + product.getProductName()));

            // Nhập kho (có thể là 0 nếu số lượng thực nhận = 0)
            inv.setQuantityInStock(inv.getQuantityInStock() + qty);
            inv.setLastUpdated(now);
            inventoryRepo.saveAndFlush(inv);

            InventoryTransaction txn = InventoryTransaction.builder()
                    .product(product)
                    .account(account)
                    .transactionType("Nhập kho")
                    .quantity(qty)
                    .unitPrice(unitPriceByProduct.getOrDefault(productId, BigDecimal.ZERO))
                    .referenceType("Phiếu nhập hàng")
                    .referenceId(po.getId())
                    .notes(cleanNotes(req.getNotes()))
                    .transactionDate(now)
                    .build();
            inventoryTxnRepo.save(txn);
        }

        BigDecimal receivedSubtotal = details.stream()
                .map(d -> Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO)
                        .multiply(BigDecimal.valueOf(Optional.ofNullable(d.getReceivedQuantity()).orElse(0))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal plannedSubtotal = details.stream()
                .map(d -> Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO)
                        .multiply(BigDecimal.valueOf(Optional.ofNullable(d.getQuantity()).orElse(0))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRatePct = BigDecimal.ZERO;
        if (plannedSubtotal.compareTo(BigDecimal.ZERO) > 0) {
            taxRatePct = Optional.ofNullable(po.getTaxAmount()).orElse(BigDecimal.ZERO)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(plannedSubtotal, 6, java.math.RoundingMode.HALF_UP);
        }
        // Tính thuế: nếu receivedSubtotal = 0 thì taxAmount = 0 (tránh lỗi khi số lượng thực nhận = 0)
        BigDecimal taxAmount = BigDecimal.ZERO;
        if (receivedSubtotal.compareTo(BigDecimal.ZERO) > 0) {
            taxAmount = receivedSubtotal.multiply(taxRatePct)
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        }
        BigDecimal receivedTotal = receivedSubtotal.add(taxAmount);

        po.setTaxAmount(taxAmount);
        po.setTotalAmount(receivedTotal);
        po.setStatus("Đã nhận hàng");
        po.setReceivedDate(LocalDateTime.now());
        purchaseOrderRepo.save(po);

        // Cập nhật cost_price trong ProductPrice với giá từ đơn hàng
        // Group theo productId để tránh update nhiều lần cho cùng một sản phẩm
        // Cho phép cập nhật cost_price ngay cả khi số lượng thực nhận = 0 (nhà cung cấp hết hàng)
        Map<UUID, BigDecimal> costPriceByProduct = new HashMap<>();
        for (PurchaseOrderDetail detail : details) {
            if (detail.getReceivedQuantity() != null) {
                UUID productId = detail.getProductId();
                BigDecimal newCostPrice = Optional.ofNullable(detail.getUnitPrice()).orElse(BigDecimal.ZERO);
                if (newCostPrice.compareTo(BigDecimal.ZERO) > 0) {
                    // Lấy giá cuối cùng nếu có nhiều detail cùng sản phẩm
                    costPriceByProduct.put(productId, newCostPrice);
                }
            }
        }
        
        // Update costPrice cho từng sản phẩm
        for (Map.Entry<UUID, BigDecimal> entry : costPriceByProduct.entrySet()) {
            UUID productId = entry.getKey();
            BigDecimal newCostPrice = entry.getValue();
            
            Optional<ProductPrice> currentPriceOpt = productPriceRepo.findCurrentPriceByProductId(productId);
            if (currentPriceOpt.isPresent()) {
                ProductPrice currentPrice = currentPriceOpt.get();
                // Cập nhật costPrice của giá hiện tại, giữ nguyên unitPrice
                currentPrice.setCostPrice(newCostPrice);
                productPriceRepo.save(currentPrice);
            } else {
                // Nếu không có giá hiện tại, tạo mới với unitPrice = costPrice
                Product product = productRepo.findById(productId)
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm: " + productId));
                ProductPrice newPrice = ProductPrice.builder()
                        .product(product)
                        .unitPrice(newCostPrice) // Nếu chưa có giá, set unitPrice = costPrice
                        .costPrice(newCostPrice)
                        .validFrom(now)
                        .createdDate(now)
                        .build();
                productPriceRepo.save(newPrice);
            }
        }

        // Thông báo cho cả Chủ cửa hàng và Nhân viên: Đơn đặt hàng đã hoàn tất nhập kho
        notifyPurchaseOrderCompleted(po);

        return mapResponse(po, details);
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public PurchaseOrderResponse revert(UUID poId, PurchaseOrderApproveRequest req, String usernameOrEmail) {
        UUID reverterAccountId = resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));

        if (!"Chờ xác nhận".equals(po.getStatus())) {
            throw new IllegalStateException("Chỉ có thể quay lại từ trạng thái 'Chờ xác nhận'. Trạng thái hiện tại: " + po.getStatus());
        }

        // Reset receivedQuantity về 0
        List<PurchaseOrderDetail> details = detailRepo.findAllForUpdateByPurchaseOrderId(poId);
        for (PurchaseOrderDetail d : details) {
            d.setReceivedQuantity(0);
        }
        detailRepo.saveAll(details);
        detailRepo.flush();

        // Tính lại tổng tiền dựa trên số lượng ban đầu
        BigDecimal plannedSubtotal = details.stream()
                .map(d -> Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO)
                        .multiply(BigDecimal.valueOf(Optional.ofNullable(d.getQuantity()).orElse(0))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tính lại thuế dựa trên tỷ lệ thuế ban đầu
        BigDecimal plannedTax = BigDecimal.ZERO;
        BigDecimal currentTax = Optional.ofNullable(po.getTaxAmount()).orElse(BigDecimal.ZERO);
        BigDecimal currentTotal = Optional.ofNullable(po.getTotalAmount()).orElse(BigDecimal.ZERO);
        
        // Tính tỷ lệ thuế từ giá trị hiện tại
        if (currentTotal.compareTo(BigDecimal.ZERO) > 0 && currentTax.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal currentSubtotal = currentTotal.subtract(currentTax);
            if (currentSubtotal.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal taxRate = currentTax.divide(currentSubtotal, 6, java.math.RoundingMode.HALF_UP);
                plannedTax = plannedSubtotal.multiply(taxRate).setScale(2, java.math.RoundingMode.HALF_UP);
            }
        }
        
        BigDecimal plannedTotal = plannedSubtotal.add(plannedTax);

        po.setStatus("Đã duyệt");
        po.setTotalAmount(plannedTotal);
        po.setTaxAmount(plannedTax);
        String base = "Phiếu đã được duyệt.";
        String extra = (req.getNotes() != null && !req.getNotes().isBlank()) ? (" " + cleanNotes(req.getNotes())) : "";
        po.setNotes(base + extra);
        purchaseOrderRepo.save(po);

        // Thông báo cho nhân viên tạo đơn: Đơn đã bị từ chối (hủy duyệt)
        try {
            notifyStaffOrderRejected(po, reverterAccountId);
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo đơn bị từ chối: {}", e.getMessage(), e);
            // Không throw exception để không làm rollback transaction chính
        }

        return mapResponse(po, details);
    }

    private PurchaseOrderResponse mapResponse(PurchaseOrder po, List<PurchaseOrderDetail> details) {
        Supplier supplier = po.getSupplierId() != null ? supplierRepo.findById(po.getSupplierId()).orElse(null) : null;
        Account account = po.getAccountId() != null ? accountRepo.findById(po.getAccountId()).orElse(null) : null;
        return purchaseOrderMapper.toResponse(po, details, supplier, account);
    }

    private PurchaseOrderDetailResponse mapDetailResponse(PurchaseOrderDetail detail, Product product) {
        BigDecimal unit = Optional.ofNullable(detail.getUnitPrice()).orElse(BigDecimal.ZERO);
        int plannedQty = Optional.ofNullable(detail.getQuantity()).orElse(0);
        int receivedQty = Optional.ofNullable(detail.getReceivedQuantity()).orElse(0);
        double unitD = unit.doubleValue();
        double totalByReceived = unit.multiply(BigDecimal.valueOf(receivedQty)).doubleValue();

        String productName = product != null ? product.getProductName() : null;
        String productCode = product != null ? product.getProductCode() : null;

        return new PurchaseOrderDetailResponse(
                detail.getId(),
                detail.getProductId(),
                productName,
                productCode,
                plannedQty,
                unitD,
                receivedQty,
                totalByReceived
        );
    }

    private UUID resolveAccountId(String usernameOrEmail) {
        return accountRepo.findByUsername(usernameOrEmail)
                .map(Account::getAccountId)
                .or(() -> accountRepo.findByEmail(usernameOrEmail).map(Account::getAccountId))
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + usernameOrEmail));
    }

    private String generateUniqueNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));

        long countToday = purchaseOrderRepo.countByOrderDateBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().atTime(23, 59, 59)
        );

        long nextNumber = countToday + 1;

        return "PO" + datePart + String.format("%03d", nextNumber);
    }

    private String cleanNotes(String notes) {
        if (notes == null) return "";
        String n = notes.trim();
        if (n.isBlank()) return "";
        if (n.toLowerCase().contains("test")) return "";
        return n;
    }

    @Override
    @Transactional(transactionManager = "tenantTransactionManager")
    public void sendPurchaseOrderEmail(PurchaseOrderEmailRequest request) {
        if (request.getPurchaseOrderIds() == null || request.getPurchaseOrderIds().isEmpty()) {
            throw new IllegalArgumentException("Danh sách đơn hàng không được rỗng");
        }

        Map<UUID, Supplier> supplierMap = new HashMap<>();
        List<String> alreadySentOrders = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Kiểm tra các đơn hàng
        for (UUID poId : request.getPurchaseOrderIds()) {
            PurchaseOrder po = purchaseOrderRepo.findById(poId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng: " + poId));

            if (!"Đã duyệt".equals(po.getStatus())) {
                throw new IllegalStateException("Chỉ có thể gửi email cho các đơn hàng ở trạng thái 'Đã duyệt'. Đơn hàng " + po.getNumber() + " có trạng thái: " + po.getStatus());
            }

            // Kiểm tra xem đơn đã được gửi chưa
            if (po.getEmailSentAt() != null && !request.isForceResend()) {
                alreadySentOrders.add(po.getNumber());
            }

            Supplier supplier = supplierRepo.findById(po.getSupplierId())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhà cung cấp cho đơn hàng: " + poId));

            if (supplier.getEmail() == null || supplier.getEmail().trim().isEmpty()) {
                throw new IllegalStateException("Nhà cung cấp " + supplier.getSupplierName() + " chưa có email. Vui lòng cập nhật email cho nhà cung cấp.");
            }

            supplierMap.putIfAbsent(supplier.getSupplierId(), supplier);
        }

        // Nếu có đơn đã được gửi và không phải force resend, throw exception
        if (!alreadySentOrders.isEmpty() && !request.isForceResend()) {
            String message = "Các đơn hàng sau đã được gửi email đến nhà cung cấp: " + String.join(", ", alreadySentOrders) + 
                           ". Bạn có muốn gửi lại không?";
            throw new IllegalStateException(message);
        }

        // Gửi email cho từng nhà cung cấp với subject và content từ client
        for (Supplier supplier : supplierMap.values()) {
            try {
                mailService.sendHtml(supplier.getEmail(), request.getSubject(), request.getHtmlContent());
            } catch (Exception e) {
                throw new RuntimeException("Không thể gửi email đến " + supplier.getEmail() + ": " + e.getMessage(), e);
            }
        }

        // Cập nhật emailSentAt cho tất cả các đơn hàng
        for (UUID poId : request.getPurchaseOrderIds()) {
            PurchaseOrder po = purchaseOrderRepo.findById(poId).orElse(null);
            if (po != null) {
                po.setEmailSentAt(now);
                purchaseOrderRepo.save(po);
            }
        }
    }

    // ================== NOTIFICATION HELPERS ==================

    /**
     * Thông báo cho Chủ cửa hàng khi có đơn đặt hàng mới cần duyệt
     */
    private void notifyShopOwnersNewPurchaseOrder(PurchaseOrder po, UUID creatorAccountId) {
        try {
            Account creator = accountRepo.findById(creatorAccountId).orElse(null);
            String creatorName = creator != null ? creator.getFullName() : "Nhân viên";

            Supplier supplier = supplierRepo.findById(po.getSupplierId()).orElse(null);
            String supplierName = supplier != null ? supplier.getSupplierName() : "Không xác định";

            String message = "Đơn đặt hàng mới cần duyệt";
            String description = String.format(
                "Nhân viên %s đã tạo đơn đặt hàng %s từ NCC %s với tổng giá trị %,.0f₫. Vui lòng xem xét và duyệt đơn.",
                creatorName, po.getNumber(), supplierName, po.getTotalAmount()
            );

            // Gửi thông báo cho tất cả Chủ cửa hàng (chỉ nếu đã bật trong cài đặt)
            List<Account> shopOwners = accountRepo.findByRoleName("Chủ cửa hàng");
            for (Account owner : shopOwners) {
                if (!notificationSettingsService.isNotificationEnabledForAccount(owner.getAccountId(), "purchase_order")) {
                    log.debug("Bỏ qua thông báo đơn nhập kho cho account {} - đã tắt trong cài đặt", owner.getAccountId());
                    continue;
                }
                notificationService.createNotificationForAccount(
                    owner.getAccountId(),
                    NotificationType.DON_DAT_HANG_CHO_DUYET,
                    message,
                    description,
                    po.getId()
                );
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo đơn đặt hàng mới: {}", e.getMessage());
        }
    }

    /**
     * Thông báo cho Nhân viên tạo đơn khi đơn đã được duyệt
     */
    private void notifyStaffOrderApproved(PurchaseOrder po) {
        try {
            Account creator = accountRepo.findById(po.getAccountId()).orElse(null);
            if (creator == null) {
                return;
            }

            Supplier supplier = supplierRepo.findById(po.getSupplierId()).orElse(null);
            String supplierName = supplier != null ? supplier.getSupplierName() : "Không xác định";

            String message = "Đơn đặt hàng đã được duyệt";
            String description = String.format(
                "Đơn đặt hàng %s từ NCC %s đã được duyệt. Vui lòng liên hệ nhà cung cấp, kiểm tra và cập nhật số lượng thực nhận khi hàng về.",
                po.getNumber(), supplierName
            );

            // Chỉ gửi thông báo nếu đã bật trong cài đặt
            if (notificationSettingsService.isNotificationEnabledForAccount(creator.getAccountId(), "purchase_order")) {
                notificationService.createNotificationForAccount(
                    creator.getAccountId(),
                    NotificationType.DON_DAT_HANG_DA_DUYET,
                    message,
                    description,
                    po.getId()
                );
            } else {
                log.debug("Bỏ qua thông báo đơn nhập kho cho account {} - đã tắt trong cài đặt", creator.getAccountId());
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo đơn được duyệt: {}", e.getMessage());
        }
    }

    /**
     * Thông báo cho Chủ cửa hàng khi Nhân viên đã cập nhật số lượng thực nhận
     */
    private void notifyShopOwnersReceivedQuantityUpdated(PurchaseOrder po, String updaterUsernameOrEmail) {
        try {
            Account updater = accountRepo.findByUsername(updaterUsernameOrEmail)
                    .or(() -> accountRepo.findByEmail(updaterUsernameOrEmail))
                    .orElse(null);
            String updaterName = updater != null ? updater.getFullName() : "Nhân viên";

            Supplier supplier = supplierRepo.findById(po.getSupplierId()).orElse(null);
            String supplierName = supplier != null ? supplier.getSupplierName() : "Không xác định";

            String message = "Đơn đặt hàng chờ xác nhận nhập kho";
            String description = String.format(
                "Nhân viên %s đã cập nhật số lượng thực nhận cho đơn %s từ NCC %s. Vui lòng kiểm tra và xác nhận nhập kho.",
                updaterName, po.getNumber(), supplierName
            );

            // Gửi thông báo cho tất cả Chủ cửa hàng (chỉ nếu đã bật trong cài đặt)
            List<Account> shopOwners = accountRepo.findByRoleName("Chủ cửa hàng");
            for (Account owner : shopOwners) {
                if (!notificationSettingsService.isNotificationEnabledForAccount(owner.getAccountId(), "purchase_order")) {
                    log.debug("Bỏ qua thông báo đơn nhập kho cho account {} - đã tắt trong cài đặt", owner.getAccountId());
                    continue;
                }
                notificationService.createNotificationForAccount(
                    owner.getAccountId(),
                    NotificationType.DON_DAT_HANG_CHO_XAC_NHAN,
                    message,
                    description,
                    po.getId()
                );
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo cập nhật số lượng thực nhận: {}", e.getMessage());
        }
    }

    /**
     * Thông báo cho cả Chủ cửa hàng và Nhân viên khi đơn đặt hàng hoàn tất nhập kho
     */
    private void notifyPurchaseOrderCompleted(PurchaseOrder po) {
        try {
            Supplier supplier = supplierRepo.findById(po.getSupplierId()).orElse(null);
            String supplierName = supplier != null ? supplier.getSupplierName() : "Không xác định";

            String message = "Đơn đặt hàng đã nhập kho thành công";
            String description = String.format(
                "Đơn đặt hàng %s từ NCC %s đã được xác nhận và nhập kho thành công với tổng giá trị %,.0f₫.",
                po.getNumber(), supplierName, po.getTotalAmount()
            );

            Set<UUID> notifiedAccountIds = new HashSet<>();

            // Thông báo cho tất cả Chủ cửa hàng (chỉ nếu đã bật trong cài đặt)
            List<Account> shopOwners = accountRepo.findByRoleName("Chủ cửa hàng");
            for (Account owner : shopOwners) {
                if (!notificationSettingsService.isNotificationEnabledForAccount(owner.getAccountId(), "purchase_order")) {
                    log.debug("Bỏ qua thông báo đơn nhập kho cho account {} - đã tắt trong cài đặt", owner.getAccountId());
                    continue;
                }
                notificationService.createNotificationForAccount(
                    owner.getAccountId(),
                    NotificationType.DON_DAT_HANG_HOAN_TAT,
                    message,
                    description,
                    po.getId()
                );
                notifiedAccountIds.add(owner.getAccountId());
            }

            // Thông báo cho Nhân viên tạo đơn (nếu chưa được thông báo và đã bật trong cài đặt)
            if (!notifiedAccountIds.contains(po.getAccountId()) && 
                notificationSettingsService.isNotificationEnabledForAccount(po.getAccountId(), "purchase_order")) {
                notificationService.createNotificationForAccount(
                    po.getAccountId(),
                    NotificationType.DON_DAT_HANG_HOAN_TAT,
                    message,
                    description,
                    po.getId()
                );
            }

        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo hoàn tất nhập kho: {}", e.getMessage());
        }
    }

    /**
     * Thông báo cho Nhân viên tạo đơn khi đơn bị từ chối (hủy duyệt)
     */
    private void notifyStaffOrderRejected(PurchaseOrder po, UUID reverterAccountId) {
        try {
            Account creator = accountRepo.findById(po.getAccountId()).orElse(null);
            if (creator == null) {
                log.warn("Không tìm thấy nhân viên tạo đơn {}", po.getNumber());
                return;
            }

            Account reverter = accountRepo.findById(reverterAccountId).orElse(null);
            String reverterName = reverter != null ? reverter.getFullName() : "Quản lý";

            Supplier supplier = supplierRepo.findById(po.getSupplierId()).orElse(null);
            String supplierName = supplier != null ? supplier.getSupplierName() : "Không xác định";

            String message = "Đơn đặt hàng bị từ chối";
            String description = String.format(
                "%s đã từ chối đơn đặt hàng %s từ NCC %s. Vui lòng kiểm tra lại thông tin và cập nhật số lượng thực nhận.",
                reverterName, po.getNumber(), supplierName
            );

            // Chỉ gửi thông báo nếu đã bật trong cài đặt
            if (notificationSettingsService.isNotificationEnabledForAccount(creator.getAccountId(), "purchase_order")) {
                notificationService.createNotificationForAccount(
                    creator.getAccountId(),
                    NotificationType.DON_DAT_HANG_BI_TU_CHOI,
                    message,
                    description,
                    po.getId()
                );
            } else {
                log.debug("Bỏ qua thông báo đơn nhập kho cho account {} - đã tắt trong cài đặt", creator.getAccountId());
            }
            log.info("Đã gửi thông báo đơn {} bị từ chối cho nhân viên {}", po.getNumber(), creator.getFullName());
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo đơn bị từ chối: {}", e.getMessage());
        }
    }

    /**
     * Thông báo cho Nhân viên tạo đơn khi đơn bị hủy
     */
    private void notifyStaffOrderCancelled(PurchaseOrder po, UUID cancellerAccountId) {
        try {
            Account creator = accountRepo.findById(po.getAccountId()).orElse(null);
            if (creator == null) {
                log.warn("Không tìm thấy nhân viên tạo đơn {}", po.getNumber());
                return;
            }

            Account canceller = accountRepo.findById(cancellerAccountId).orElse(null);
            String cancellerName = canceller != null ? canceller.getFullName() : "Quản lý";

            Supplier supplier = supplierRepo.findById(po.getSupplierId()).orElse(null);
            String supplierName = supplier != null ? supplier.getSupplierName() : "Không xác định";

            String message = "Đơn đặt hàng đã bị hủy";
            String description = String.format(
                "%s đã hủy đơn đặt hàng %s từ NCC %s.",
                cancellerName, po.getNumber(), supplierName
            );

            // Chỉ gửi thông báo nếu đã bật trong cài đặt
            if (notificationSettingsService.isNotificationEnabledForAccount(creator.getAccountId(), "purchase_order")) {
                notificationService.createNotificationForAccount(
                    creator.getAccountId(),
                    NotificationType.DON_DAT_HANG_BI_HUY,
                    message,
                    description,
                    po.getId()
                );
            } else {
                log.debug("Bỏ qua thông báo đơn nhập kho cho account {} - đã tắt trong cài đặt", creator.getAccountId());
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo đơn bị hủy: {}", e.getMessage());
        }
    }

}