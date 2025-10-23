package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

public record PurchaseOrderReceiveRequest(
        @NotNull UUID accountId,
        List<ReceivedItem> items,
        String notes
) {
    public record ReceivedItem(
            @NotNull UUID purchaseOrderDetailId,
            @PositiveOrZero int receivedQuantity
    ) {}
}
