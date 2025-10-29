package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.response.PurchaseOrderDetailResponse;
import com.g127.snapbuy.dto.response.PurchaseOrderResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.PurchaseOrder;
import com.g127.snapbuy.entity.PurchaseOrderDetail;
import com.g127.snapbuy.entity.Supplier;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Mapper(componentModel = "spring")
public interface PurchaseOrderMapper {

    @Mapping(target = "purchaseOrderId", source = "po.id")
    @Mapping(target = "purchaseOrderNumber", source = "po.number")
    @Mapping(target = "supplierId", source = "po.supplierId")
    @Mapping(target = "accountId", source = "po.accountId")
    @Mapping(target = "status", source = "po.status")
    @Mapping(target = "totalAmount", expression = "java(toDouble(po.getTotalAmount()))")
    @Mapping(target = "taxAmount", expression = "java(toDouble(po.getTaxAmount()))")
    @Mapping(target = "notes", source = "po.notes")
    @Mapping(target = "orderDate", source = "po.orderDate")
    @Mapping(target = "receivedDate", source = "po.receivedDate")
    @Mapping(target = "details", expression = "java(toDetailResponses(details))")
    @Mapping(target = "supplierCode", expression = "java(supplier != null ? supplier.getSupplierCode() : null)")
    @Mapping(target = "supplierName", expression = "java(supplier != null ? supplier.getSupplierName() : null)")
    @Mapping(target = "fullName", expression = "java(account != null ? account.getFullName() : null)")
    @Mapping(target = "username", expression = "java(account != null ? account.getUsername() : null)")
    PurchaseOrderResponse toResponse(PurchaseOrder po,
                                     List<PurchaseOrderDetail> details,
                                     Supplier supplier,
                                     Account account);

    default Double toDouble(BigDecimal v) {
        return Optional.ofNullable(v).map(BigDecimal::doubleValue).orElse(0.0d);
    }

    default List<PurchaseOrderDetailResponse> toDetailResponses(List<PurchaseOrderDetail> details) {
        if (details == null) return java.util.List.of();
        return details.stream().map(x -> {
            BigDecimal unit = java.util.Optional.ofNullable(x.getUnitPrice()).orElse(BigDecimal.ZERO);
            int plannedQty = java.util.Optional.ofNullable(x.getQuantity()).orElse(0);
            int receivedQty = java.util.Optional.ofNullable(x.getReceivedQuantity()).orElse(0);
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
    }
}
