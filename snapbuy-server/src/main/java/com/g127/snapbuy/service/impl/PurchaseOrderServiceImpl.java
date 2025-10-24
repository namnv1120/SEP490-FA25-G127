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

        BigDecimal plannedSubtotal = req.items().stream()
                .map(i -> BigDecimal.valueOf(i.unitPrice()).multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

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
                .totalAmount(plannedTotal)
                .taxAmount(plannedTax)
                .notes(req.notes())
                .build();
        purchaseOrderRepo.save(po);

        List<PurchaseOrderDetail> details = req.items().stream().map(i ->
                PurchaseOrderDetail.builder()
                        .id(UUID.randomUUID())
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
    public PurchaseOrderResponse receive(UUID poId, PurchaseOrderReceiveRequest req) {
        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Purchase order not found"));
        if (Objects.equals(po.getStatus(), "CANCELLED")) {
            throw new IllegalStateException("Cannot receive a cancelled purchase order");
        }
        if (Objects.equals(po.getStatus(), "RECEIVED")) {
            throw new IllegalStateException("Purchase order already received and cannot be modified");
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
                    .orElseThrow(() -> new NoSuchElementException("Detail not found: " + detailId));

            int planned = Optional.ofNullable(d.getQuantity()).orElse(0);
            int receivedSoFar = Optional.ofNullable(d.getReceivedQuantity()).orElse(0);
            int remaining = Math.max(planned - receivedSoFar, 0);

            if (importQty < 0) throw new IllegalArgumentException("receivedQuantity must be >= 0");
            if (importQty > remaining) {
                throw new IllegalStateException("Import quantity exceeds remaining planned quantity");
            }

            d.setReceivedQuantity(receivedSoFar + importQty);
        }
        detailRepo.saveAll(details);

        LocalDateTime now = LocalDateTime.now();
        var account = accountRepo.findById(req.accountId())
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + req.accountId()));

        Map<UUID, Integer> importByProduct = new HashMap<>();
        Map<UUID, BigDecimal> unitPriceByProduct = new HashMap<>();
        for (var e : importQtyByDetail.entrySet()) {
            PurchaseOrderDetail d = byId.get(e.getKey());
            int importQty = e.getValue();
            if (importQty <= 0) continue;
            importByProduct.merge(d.getProductId(), importQty, Integer::sum);
            unitPriceByProduct.putIfAbsent(d.getProductId(),
                    Optional.ofNullable(d.getUnitPrice()).orElse(BigDecimal.ZERO));
        }

        for (var e : importByProduct.entrySet()) {
            UUID productId = e.getKey();
            int qty = e.getValue();

            var product = productRepo.findById(productId)
                    .orElseThrow(() -> new NoSuchElementException("Product not found: " + productId));

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
                    .transactionType("IMPORT")
                    .quantity(qty)
                    .unitPrice(unitPriceByProduct.getOrDefault(productId, BigDecimal.ZERO))
                    .referenceType("PURCHASE_ORDER")
                    .referenceId(poId)
                    .notes(req.notes())
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

        po.setStatus("RECEIVED");
        po.setReceivedDate(now);
        purchaseOrderRepo.save(po);

        return toResponse(po, details);
    }

    @Override
    @Transactional
    public PurchaseOrderResponse cancel(UUID poId) {
        PurchaseOrder po = purchaseOrderRepo.findById(poId)
                .orElseThrow(() -> new NoSuchElementException("Purchase order not found")); // [attached_file:3]

        if (Objects.equals(po.getStatus(), "RECEIVED")) {
            throw new IllegalStateException("Cannot cancel a received purchase order");
        }

        List<PurchaseOrderDetail> details = detailRepo.findByPurchaseOrderId(poId);
        for (PurchaseOrderDetail d : details) {
            d.setReceivedQuantity(0);
        }
        detailRepo.saveAll(details);

        BigDecimal receivedSubtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;

        po.setTaxAmount(taxAmount);
        po.setTotalAmount(total);
        po.setStatus("CANCELLED");
        po.setReceivedDate(null);
        purchaseOrderRepo.save(po);

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
