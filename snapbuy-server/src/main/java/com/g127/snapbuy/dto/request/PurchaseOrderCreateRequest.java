package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderCreateRequest {

    @NotNull
    private UUID supplierId;

    @NotEmpty
    private List<Item> items = new ArrayList<>();

    private String notes;

    @PositiveOrZero
    private BigDecimal taxAmount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        @NotNull
        private UUID productId;

        @Positive
        private int quantity;

        @PositiveOrZero
        private BigDecimal unitPrice;
    }
}
