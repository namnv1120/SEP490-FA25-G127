package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.PurchaseOrderApproveRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderCreateRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderReceiveRequest;
import com.g127.snapbuy.dto.response.PurchaseOrderResponse;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.mapper.PurchaseOrderMapper;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.PurchaseOrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepo;
    private final PurchaseOrderDetailRepository detailRepo;
    private final InventoryRepository inventoryRepo;
    private final InventoryTransactionRepository inventoryTxnRepo;
    private final ProductRepository productRepo;
    private final AccountRepository accountRepo;
    private final SupplierRepository supplierRepo;
    private final PurchaseOrderMapper purchaseOrderMapper;

    @Override
    @Transactional
    public PurchaseOrderResponse create(PurchaseOrderCreateRequest req, String usernameOrEmail) {
        UUID currentAccountId = resolveAccountId(usernameOrEmail);

        supplierRepo.findById(req.supplierId())
                .orElseThrow(() -> new NoSuchElementException("Nhà cung cấp không tồn tại: " + req.supplierId()));

        for (var i : req.items()) {
            productRepo.findById(i.productId())
                    .orElseThrow(() -> new NoSuchElementException("Sản phẩm không tồn tại: " + i.productId()));
            if (i.quantity() <= 0) throw new IllegalArgumentException("Số lượng phải > 0");
            if (i.unitPrice() <= 0) throw new IllegalArgumentException("Đơn giá phải > 0");
        }

        String number = generateUniqueNumber();
        LocalDateTime now = LocalDateTime.now();

        BigDecimal plannedSubtotal = req.items().stream()
                .map(i -> BigDecimal.valueOf(i.unitPrice()).multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRatePct = Optional.ofNullable(req.taxAmount()).orElse(BigDecimal.ZERO);
        BigDecimal plannedTax = plannedSubtotal.multiply(taxRatePct)
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal plannedTotal = plannedSubtotal.add(plannedTax);

        String cleanedNotes = cleanNotes(req.notes());

        PurchaseOrder po = PurchaseOrder.builder()
                .number(number)
                .supplierId(req.supplierId())
                .accountId(currentAccountId)
                .orderDate(now)
                .status("Chờ duyệt")
                .totalAmount(plannedTotal)
                .taxAmount(plannedTax)
                .notes(cleanedNotes)
                .build();

        purchaseOrderRepo.save(po);
        purchaseOrderRepo.flush();

        UUID poId = po.getId();

        List<PurchaseOrderDetail> details = req.items().stream().map(i ->
                PurchaseOrderDetail.builder()
                        .purchaseOrderId(poId)
                        .productId(i.productId())
                        .quantity(i.quantity())
                        .unitPrice(BigDecimal.valueOf(i.unitPrice()))
                        .receivedQuantity(0)
                        .build()
        ).toList();

        detailRepo.saveAll(details);
        // flush để đảm bảo chi tiết đã persist đầy đủ (tránh lỗi unsaved-value nếu có ràng buộc)
        detailRepo.flush();

        return mapResponse(po, details);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse approve(UUID poId, PurchaseOrderApproveRequest req, String usernameOrEmail) {
        resolveAccountId(usernameOrEmail); // chỉ để xác thực tài khoản, chưa dùng id

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));

        if ("Đã hủy".equals(po.getStatus())) throw new IllegalStateException("Phiếu đã hủy, không thể duyệt");
        if ("Đã nhận hàng".equals(po.getStatus())) throw new IllegalStateException("Phiếu đã hoàn tất, không thể duyệt");
        if (!"Chờ duyệt".equals(po.getStatus())) throw new IllegalStateException("Chỉ duyệt phiếu ở trạng thái 'Chờ duyệt'");

        if (req.ownerAccountId() != null) {
            accountRepo.findById(req.ownerAccountId())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản chủ cửa hàng"));
        }

        po.setStatus("Đã duyệt");
        String base = "Phiếu đã được duyệt.";
        String extra = (req.notes() != null && !req.notes().isBlank()) ? (" " + cleanNotes(req.notes())) : "";
        po.setNotes(base + extra);
        purchaseOrderRepo.save(po);

        List<PurchaseOrderDetail> details = detailRepo.findByPurchaseOrderId(poId);
        return mapResponse(po, details);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse receive(UUID poId, PurchaseOrderReceiveRequest req, String usernameOrEmail) {
        UUID receiverId = resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));

        if (!"Đã duyệt".equals(po.getStatus())) {
            if ("Đã hủy".equals(po.getStatus()))
                throw new IllegalStateException("Phiếu nhập hàng đã bị hủy, không thể xác nhận nhập kho.");
            if ("Đã nhận hàng".equals(po.getStatus()))
                throw new IllegalStateException("Phiếu nhập hàng đã hoàn tất, không thể chỉnh sửa.");
            throw new IllegalStateException("Phiếu nhập hàng chưa được duyệt, không thể xác nhận nhập kho.");
        }

        // 1) Khóa chi tiết
        List<PurchaseOrderDetail> details = detailRepo.findAllForUpdateByPurchaseOrderId(poId);
        Map<UUID, PurchaseOrderDetail> byId = details.stream()
                .collect(Collectors.toMap(PurchaseOrderDetail::getId, d -> d));

        Map<UUID, Integer> importQtyByDetail = new HashMap<>();
        for (PurchaseOrderDetail d : details) {
            int planned = Optional.ofNullable(d.getQuantity()).orElse(0);
            int received = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
            importQtyByDetail.put(d.getId(), Math.max(planned - received, 0));
        }
        if (req.items() != null && !req.items().isEmpty()) {
            for (var it : req.items()) {
                if (it.receivedQuantity() < 0) throw new IllegalArgumentException("Số lượng nhận phải ≥ 0");
                importQtyByDetail.put(it.purchaseOrderDetailId(), it.receivedQuantity());
            }
        }

        for (var e : importQtyByDetail.entrySet()) {
            var d = Optional.ofNullable(byId.get(e.getKey()))
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy dòng chi tiết: " + e.getKey()));
            int planned = Optional.ofNullable(d.getQuantity()).orElse(0);
            int received = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
            int add = e.getValue();
            int remaining = Math.max(planned - received, 0);
            if (add > remaining) throw new IllegalStateException("Số lượng nhận vượt quá kế hoạch");
            d.setReceivedQuantity(received + add);
        }
        detailRepo.saveAll(details);
        detailRepo.flush();

        // 2) Cập nhật tồn kho
        LocalDateTime now = LocalDateTime.now();
        var account = accountRepo.findById(receiverId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + receiverId));

        Map<UUID, Integer> importByProduct = new HashMap<>();
        Map<UUID, BigDecimal> unitPriceByProduct = new HashMap<>();
        for (var e : importQtyByDetail.entrySet()) {
            var d = byId.get(e.getKey());
            int qty = e.getValue();
            if (qty > 0) {
                importByProduct.merge(d.getProductId(), qty, Integer::sum);
                unitPriceByProduct.putIfAbsent(d.getProductId(),
                        Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO));
            }
        }

        for (var e : importByProduct.entrySet()) {
            UUID productId = e.getKey();
            int qty = e.getValue();

            var product = productRepo.findById(productId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm: " + productId));

            // Lock nếu có, nếu chưa có thì tạo + flush ngay
            Inventory inv = inventoryRepo.lockByProductId(productId)
                    .orElseGet(() -> {
                        Inventory i = new Inventory();
                        i.setProduct(product);
                        i.setQuantityInStock(0);
                        i.setLastUpdated(now);
                        return inventoryRepo.saveAndFlush(i);
                    });

            inv.setQuantityInStock(inv.getQuantityInStock() + qty);
            inv.setLastUpdated(now);
            // flush để tránh "unsaved-value mapping" khi tiếp tục ghi InventoryTransaction
            inventoryRepo.saveAndFlush(inv);

            InventoryTransaction txn = InventoryTransaction.builder()
                    .product(product)
                    .account(account)
                    .transactionType("Nhập kho")
                    .quantity(qty)
                    .unitPrice(unitPriceByProduct.getOrDefault(productId, BigDecimal.ZERO))
                    .referenceType("Phiếu nhập hàng")
                    .referenceId(po.getId())
                    .notes(cleanNotes(req.notes()))
                    .transactionDate(now)
                    .build();
            inventoryTxnRepo.save(txn);
        }

        // 3) Tính lại tiền
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
        BigDecimal taxAmount = receivedSubtotal.multiply(taxRatePct)
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal receivedTotal = receivedSubtotal.add(taxAmount);

        po.setTaxAmount(taxAmount);
        po.setTotalAmount(receivedTotal);
        po.setStatus("Đã nhận hàng");
        po.setReceivedDate(LocalDateTime.now());
        purchaseOrderRepo.save(po);

        return mapResponse(po, details);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse cancel(UUID poId, String usernameOrEmail) {
        resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));
        if ("Đã nhận hàng".equals(po.getStatus())) throw new IllegalStateException("Không thể hủy phiếu đã hoàn tất");

        List<PurchaseOrderDetail> details = detailRepo.findAllForUpdateByPurchaseOrderId(poId);
        for (PurchaseOrderDetail d : details) d.setReceivedQuantity(0);
        detailRepo.saveAll(details);
        detailRepo.flush();

        po.setTaxAmount(BigDecimal.ZERO);
        po.setTotalAmount(BigDecimal.ZERO);
        po.setStatus("Đã hủy");
        po.setReceivedDate(null);
        purchaseOrderRepo.save(po);

        return mapResponse(po, details);
    }


    @Override
    @Transactional
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
    @Transactional
    public Page<PurchaseOrderResponse> search(String status, UUID supplierId, LocalDateTime from, LocalDateTime to, Pageable pageable) {
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

        return page.map(po -> purchaseOrderMapper.toResponse(
                po,
                detailsByPo.getOrDefault(po.getId(), List.of()),
                supplierMap.getOrDefault(po.getSupplierId(), null),
                accountMap.getOrDefault(po.getAccountId(), null)
        ));
    }

    private PurchaseOrderResponse mapResponse(PurchaseOrder po, List<PurchaseOrderDetail> details) {
        Supplier supplier = po.getSupplierId() != null ? supplierRepo.findById(po.getSupplierId()).orElse(null) : null;
        Account account = po.getAccountId() != null ? accountRepo.findById(po.getAccountId()).orElse(null) : null;
        return purchaseOrderMapper.toResponse(po, details, supplier, account);
    }

    private UUID resolveAccountId(String usernameOrEmail) {
        return accountRepo.findByUsername(usernameOrEmail)
                .map(Account::getAccountId)
                .or(() -> accountRepo.findByEmail(usernameOrEmail).map(Account::getAccountId))
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + usernameOrEmail));
    }

    private String generateUniqueNumber() {
        String number;
        int attempts = 0;
        do {
            number = generateNumber();
            attempts++;
        } while (purchaseOrderRepo.existsByNumber(number) && attempts < 5);
        if (purchaseOrderRepo.existsByNumber(number)) {
            throw new IllegalStateException("Không tạo được số phiếu duy nhất, vui lòng thử lại");
        }
        return number;
    }

    private String generateNumber() {
        String date = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        String suffix = java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "PO-" + date + "-" + suffix;
    }

    private String cleanNotes(String notes) {
        if (notes == null) return "";
        String n = notes.trim();
        if (n.isBlank()) return "";
        if (n.toLowerCase().contains("test")) return "";
        return n;
    }
}
