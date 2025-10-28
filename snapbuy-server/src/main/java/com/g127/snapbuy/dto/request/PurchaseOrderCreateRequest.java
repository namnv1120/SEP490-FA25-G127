package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;

import java.util.List;
import java.util.UUID;

public record PurchaseOrderCreateRequest(
        @NotNull UUID supplierId,
        @NotNull UUID accountId,
        @NotEmpty List<Item> items,
        String notes,
        @PositiveOrZero double taxAmount
) {
    public record Item(
            @NotNull UUID productId,
            @Positive int quantity,
            @Positive double unitPrice
    ) {
    }
}
