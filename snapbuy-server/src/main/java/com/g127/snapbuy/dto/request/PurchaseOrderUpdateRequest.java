package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderUpdateRequest {

    @NotEmpty
    private List<Item> items;
    private String notes;
    @PositiveOrZero
    private BigDecimal taxAmount;
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Item {
        @NotNull
        private UUID productId;
        @Positive
        private int quantity;
        @Positive
        private BigDecimal unitPrice;
        @PositiveOrZero
        private Integer receiveQuantity;
    }
}