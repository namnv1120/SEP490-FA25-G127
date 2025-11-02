package com.g127.snapbuy.dto.response;

import java.util.UUID;

public record PurchaseOrderDetailResponse(
        UUID purchaseOrderDetailId,
        UUID productId,
        String productName,
        String productCode,
        int quantity,
        double unitPrice,
        int receivedQuantity,
        double totalPrice
) {
}