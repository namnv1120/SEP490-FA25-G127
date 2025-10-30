package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record PurchaseOrderReceiveRequest(
        List<Item> items,
        String notes
) {
    public record Item(
            @NotNull UUID purchaseOrderDetailId,
            @PositiveOrZero int receivedQuantity
    ) {}
}
