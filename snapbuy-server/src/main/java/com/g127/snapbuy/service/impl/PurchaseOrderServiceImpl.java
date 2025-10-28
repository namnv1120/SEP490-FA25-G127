package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.PurchaseOrderApproveRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderCreateRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderReceiveRequest;
import com.g127.snapbuy.dto.response.PurchaseOrderDetailResponse;
import com.g127.snapbuy.dto.response.PurchaseOrderResponse;
import com.g127.snapbuy.entity.Inventory;
import com.g127.snapbuy.entity.InventoryTransaction;
import com.g127.snapbuy.entity.PurchaseOrder;
import com.g127.snapbuy.entity.PurchaseOrderDetail;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.PurchaseOrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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

    @Override
    @Transactional
    public PurchaseOrderResponse create(PurchaseOrderCreateRequest req, String usernameOrEmail) {
        UUID currentAccountId = resolveAccountId(usernameOrEmail);

        String number = generateUniqueNumber();
        LocalDateTime now = LocalDateTime.now();

        BigDecimal plannedSubtotal = req.items().stream()
                .map(i -> BigDecimal.valueOf(i.unitPrice()).multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRatePct = Optional.ofNullable(req.taxAmount()).map(BigDecimal::valueOf).orElse(BigDecimal.ZERO);
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

        return toResponse(po, details);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse approve(UUID poId, PurchaseOrderApproveRequest req, String usernameOrEmail) {
        UUID approverId = resolveAccountId(usernameOrEmail);

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
        return toResponse(po, details);
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

        List<PurchaseOrderDetail> details = detailRepo.findByPurchaseOrderId(poId);
        Map<UUID, PurchaseOrderDetail> byId = details.stream()
                .collect(Collectors.toMap(PurchaseOrderDetail::getId, d -> d));

        Map<UUID, Integer> importQtyByDetail = new HashMap<>();
        for (PurchaseOrderDetail d : details) {
            int planned = Optional.ofNullable(d.getQuantity()).orElse(0);
            int receivedSoFar = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
            int remaining = Math.max(planned - receivedSoFar, 0);
            importQtyByDetail.put(d.getId(), remaining);
        }
        if (req.items() != null) {
            for (var it : req.items()) {
                importQtyByDetail.put(it.purchaseOrderDetailId(), it.receivedQuantity());
            }
        }

        for (var e : importQtyByDetail.entrySet()) {
            UUID detailId = e.getKey();
            int importQty = e.getValue();
            PurchaseOrderDetail d = Optional.ofNullable(byId.get(detailId))
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy dòng chi tiết: " + detailId));

            int planned = Optional.ofNullable(d.getQuantity()).orElse(0);
            int receivedSoFar = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
            int remaining = Math.max(planned - receivedSoFar, 0);

            if (importQty < 0) throw new IllegalArgumentException("Số lượng nhận phải ≥ 0");
            if (importQty > remaining)
                throw new IllegalStateException("Số lượng nhận vượt quá số lượng còn lại theo kế hoạch");

            d.setReceivedQuantity(receivedSoFar + importQty);
        }
        detailRepo.saveAll(details);

        LocalDateTime now = LocalDateTime.now();

        var account = accountRepo.findById(receiverId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + receiverId));

        Map<UUID, Integer> importByProduct = new HashMap<>();
        Map<UUID, BigDecimal> unitPriceByProduct = new HashMap<>();
        for (var e : importQtyByDetail.entrySet()) {
            PurchaseOrderDetail d = byId.get(e.getKey());
            int importQty = e.getValue();
            if (importQty <= 0) continue;
            importByProduct.merge(d.getProductId(), importQty, Integer::sum);
            unitPriceByProduct.putIfAbsent(d.getProductId(), Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO));
        }

        for (var e : importByProduct.entrySet()) {
            UUID productId = e.getKey();
            int qty = e.getValue();

            var product = productRepo.findById(productId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm: " + productId));

            Optional<Inventory> invOpt = inventoryRepo.lockByProductId(productId);
            Inventory inv = invOpt.orElseGet(() -> {
                Inventory i = new Inventory();
                i.setInventoryId(UUID.randomUUID());
                i.setProduct(product);
                i.setQuantityInStock(0);
                i.setLastUpdated(now);
                return i;
            });
            inv.setQuantityInStock(inv.getQuantityInStock() + qty);
            inv.setLastUpdated(now);
            inventoryRepo.save(inv);

            InventoryTransaction txn = InventoryTransaction.builder()
                    .transactionId(UUID.randomUUID())
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
        po.setReceivedDate(now);
        purchaseOrderRepo.save(po);

        return toResponse(po, details);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse cancel(UUID poId, String usernameOrEmail) {
        UUID actorId = resolveAccountId(usernameOrEmail);

        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy phiếu nhập hàng"));

        if ("Đã nhận hàng".equals(po.getStatus())) throw new IllegalStateException("Không thể hủy phiếu đã hoàn tất");

        List<PurchaseOrderDetail> details = detailRepo.findByPurchaseOrderId(poId);
        for (PurchaseOrderDetail d : details) d.setReceivedQuantity(0);
        detailRepo.saveAll(details);

        po.setTaxAmount(BigDecimal.ZERO);
        po.setTotalAmount(BigDecimal.ZERO);
        po.setStatus("Đã hủy");
        po.setReceivedDate(null);
        purchaseOrderRepo.save(po);

        return toResponse(po, details);
    }

    private UUID resolveAccountId(String usernameOrEmail) {
        return accountRepo.findByUsername(usernameOrEmail)
                .map(a -> a.getAccountId())
                .or(() -> accountRepo.findByEmail(usernameOrEmail).map(a -> a.getAccountId()))
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + usernameOrEmail));
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po, List<PurchaseOrderDetail> details) {
        List<PurchaseOrderDetailResponse> d = details.stream().map(x -> {
            BigDecimal unit = Optional.ofNullable(x.getUnitPrice()).orElse(BigDecimal.ZERO);
            int plannedQty = Optional.ofNullable(x.getQuantity()).orElse(0);
            int receivedQty = Optional.ofNullable(x.getReceivedQuantity()).orElse(0);

            double unitD = unit.doubleValue();
            double totalByReceived = unit.multiply(BigDecimal.valueOf(receivedQty)).doubleValue();

            return new PurchaseOrderDetailResponse(
                    x.getId(),
                    x.getProductId(),
                    plannedQty,
                    unitD,
                    receivedQty,
                    totalByReceived
            );
        }).toList();

        return new PurchaseOrderResponse(
                po.getId(),
                po.getNumber(),
                po.getSupplierId(),
                po.getAccountId(),
                po.getStatus(),
                Optional.ofNullable(po.getTotalAmount()).orElse(BigDecimal.ZERO).doubleValue(),
                Optional.ofNullable(po.getTaxAmount()).orElse(BigDecimal.ZERO).doubleValue(),
                po.getNotes(),
                po.getOrderDate(),
                po.getReceivedDate(),
                d
        );
    }

    @Override
    @Transactional
    public List<PurchaseOrderResponse> findAll() {
        List<PurchaseOrder> pos = purchaseOrderRepo.findAll();
        // nạp chi tiết theo id để response đầy đủ
        Map<UUID, List<PurchaseOrderDetail>> detailsByPo = detailRepo.findAll().stream()
                .collect(Collectors.groupingBy(PurchaseOrderDetail::getPurchaseOrderId));
        return pos.stream()
                .map(po -> toResponse(po, detailsByPo.getOrDefault(po.getId(), List.of())))
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
        List<PurchaseOrderDetail> details = poIds.isEmpty() ? List.of() : detailRepo.findAll().stream()
                .filter(d -> poIds.contains(d.getPurchaseOrderId()))
                .toList();
        Map<UUID, List<PurchaseOrderDetail>> detailsByPo = details.stream()
                .collect(Collectors.groupingBy(PurchaseOrderDetail::getPurchaseOrderId));

        return page.map(po -> toResponse(po, detailsByPo.getOrDefault(po.getId(), List.of())));
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
