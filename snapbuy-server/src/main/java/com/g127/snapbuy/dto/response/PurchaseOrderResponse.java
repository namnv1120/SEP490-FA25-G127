package com.g127.snapbuy.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PurchaseOrderResponse(
        UUID purchaseOrderId,
        String purchaseOrderNumber,
        UUID supplierId,
        UUID accountId,
        String status,
        Double totalAmount,
        Double taxAmount,
        String notes,
        LocalDateTime orderDate,
        LocalDateTime receivedDate,
        List<PurchaseOrderDetailResponse> details,
        String supplierCode,
        String supplierName,
        String fullName,
        String username
) {}
