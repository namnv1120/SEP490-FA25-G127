package com.g127.snapbuy.service.impl;

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
    public PurchaseOrderResponse create(PurchaseOrderCreateRequest req) {
        UUID poId = UUID.randomUUID();
        String number = generateNumber();
        LocalDateTime now = LocalDateTime.now();

        // Subtotal theo planned
        BigDecimal plannedSubtotal = req.items().stream()
                .map(i -> BigDecimal.valueOf(i.unitPrice()).multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Thuế suất % nhập từ request (ví dụ 10 -> 10%)
        BigDecimal taxRatePct = Optional.ofNullable(req.taxAmount()).map(BigDecimal::valueOf).orElse(BigDecimal.ZERO);
        BigDecimal plannedTax = plannedSubtotal.multiply(taxRatePct)
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal plannedTotal = plannedSubtotal.add(plannedTax);

        PurchaseOrder po = PurchaseOrder.builder()
                .id(poId)
                .number(number)
                .supplierId(req.supplierId())
                .accountId(req.accountId())
                .orderDate(now)
                .status("PENDING")
                .totalAmount(plannedTotal)  // subtotal + tax
                .taxAmount(plannedTax)      // lưu số tiền thuế
                .notes(req.notes())
                .build();
        purchaseOrderRepo.save(po);

        // Mặc định nhận đủ để totalPrice (received * unit) phản ánh đủ hàng
        List<PurchaseOrderDetail> details = req.items().stream().map(i ->
                PurchaseOrderDetail.builder()
                        .id(UUID.randomUUID())
                        .purchaseOrderId(poId)
                        .productId(i.productId())
                        .quantity(i.quantity())
                        .unitPrice(BigDecimal.valueOf(i.unitPrice()))
                        .receivedQuantity(i.quantity())
                        .build()
        ).toList();
        detailRepo.saveAll(details);

        return toResponse(po, details);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse receive(UUID poId, PurchaseOrderReceiveRequest req) {
        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Purchase order not found"));
        if (Objects.equals(po.getStatus(), "CANCELLED")) {
            throw new IllegalStateException("Cannot receive a cancelled purchase order");
        }

        // Load details và "before" map
        List<PurchaseOrderDetail> details = detailRepo.findByPurchaseOrderId(poId);
        Map<UUID, PurchaseOrderDetail> byId = details.stream()
                .collect(Collectors.toMap(PurchaseOrderDetail::getId, d -> d));
        Map<UUID, Integer> beforeMap = details.stream()
                .collect(Collectors.toMap(PurchaseOrderDetail::getId,
                        d -> Optional.ofNullable(d.getReceivedQuantity()).orElse(0)));

        // Map 'target' theo giá trị tuyệt đối (mặc định = current, payload ghi đè)
        Map<UUID, Integer> targetReceived = new HashMap<>(beforeMap);
        if (req.items() != null) {
            for (var it : req.items()) {
                targetReceived.put(it.purchaseOrderDetailId(), it.receivedQuantity());
            }
        }

        // Validate & GHI ĐÈ receivedQuantity
        for (var entry : targetReceived.entrySet()) {
            UUID detailId = entry.getKey();
            int newReceived = entry.getValue();
            PurchaseOrderDetail d = Optional.ofNullable(byId.get(detailId))
                    .orElseThrow(() -> new NoSuchElementException("Detail not found: " + detailId));

            int planned = Optional.ofNullable(d.getQuantity()).orElse(0);
            if (newReceived < 0) throw new IllegalArgumentException("receivedQuantity must be >= 0");
            if (newReceived > planned) {
                throw new IllegalStateException("Received exceeds planned quantity");
            }
            d.setReceivedQuantity(newReceived);
        }
        detailRepo.saveAll(details);

        // Cập nhật tồn kho & transaction theo delta (after - before)
        LocalDateTime now = LocalDateTime.now();
        var account = accountRepo.findById(req.accountId())
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + req.accountId()));

        for (PurchaseOrderDetail d : details) {
            int before = Optional.ofNullable(beforeMap.get(d.getId())).orElse(0);
            int after = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
            int delta = after - before;
            if (delta == 0) continue;

            var product = productRepo.findById(d.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Product not found: " + d.getProductId()));

            Optional<Inventory> invOpt = inventoryRepo.lockByProductId(d.getProductId());
            Inventory inv = invOpt.orElseGet(() -> {
                Inventory i = new Inventory();
                i.setInventoryId(UUID.randomUUID());
                i.setProduct(product);
                i.setQuantityInStock(0);
                i.setLastUpdated(now);
                return i;
            });
            inv.setQuantityInStock(inv.getQuantityInStock() + delta);
            inv.setLastUpdated(now);
            inventoryRepo.save(inv);

            String txnType = delta >= 0 ? "IMPORT" : "EXPORT";
            InventoryTransaction txn = InventoryTransaction.builder()
                    .transactionId(UUID.randomUUID())
                    .product(product)
                    .account(account)
                    .transactionType(txnType)
                    .quantity(Math.abs(delta))
                    .unitPrice(d.getUnitPrice())
                    .referenceType("PURCHASE_ORDER")
                    .referenceId(poId)
                    .notes(req.notes())
                    .transactionDate(now)
                    .build();
            inventoryTxnRepo.save(txn);
        }

        // TÍNH LẠI THUẾ & TỔNG theo thực nhận, giữ thuế suất như lúc tạo
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
        po.setStatus("RECEIVED");
        po.setReceivedDate(now);
        purchaseOrderRepo.save(po);

        return toResponse(po, details);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse cancel(UUID poId) {
        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Purchase order not found"));
        if (Objects.equals(po.getStatus(), "RECEIVED")) {
            throw new IllegalStateException("Cannot cancel a received purchase order");
        }
        po.setStatus("CANCELLED");
        purchaseOrderRepo.save(po);
        List<PurchaseOrderDetail> details = detailRepo.findByPurchaseOrderId(poId);
        return toResponse(po, details);
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

    private String generateNumber() {
        String date = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "PO-" + date + "-" + suffix;
    }
}
