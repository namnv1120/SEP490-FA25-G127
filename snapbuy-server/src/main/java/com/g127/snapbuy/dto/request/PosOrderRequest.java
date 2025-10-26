package com.g127.snapbuy.dto.request;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class PosOrderRequest {
    private UUID customerId;
    private List<Item> items;
    private String paymentMethod;

    @Data
    public static class Item {
        private UUID productId;
        private int quantity;
        private double unitPrice;
    }
}
