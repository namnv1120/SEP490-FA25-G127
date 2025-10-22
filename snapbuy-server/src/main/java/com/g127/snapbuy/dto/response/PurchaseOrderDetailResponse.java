package com.g127.snapbuy.dto.response;

import java.util.UUID;

public record PurchaseOrderDetailResponse(
        UUID purchaseOrderDetailId,
        UUID productId,
        int quantity,
        double unitPrice,
        int receivedQuantity,
        double totalPrice
) {
}
