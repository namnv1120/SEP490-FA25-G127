package com.g127.snapbuy.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDetailResponse {
    private UUID purchaseOrderDetailId;
    private UUID productId;
    private int quantity;
    private double unitPrice;
    private int receivedQuantity;
    private double totalPrice;
}
