package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PurchaseOrderUpdateRequest(
        @NotEmpty List<Item> items,
        String notes,
        @PositiveOrZero BigDecimal taxAmount
) {
    public record Item(
            @NotNull UUID productId,
            @Positive int quantity,
            @Positive double unitPrice
    ) { }
}

