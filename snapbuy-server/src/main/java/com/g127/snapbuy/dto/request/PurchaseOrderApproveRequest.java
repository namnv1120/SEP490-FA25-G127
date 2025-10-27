package com.g127.snapbuy.dto.request;

import java.util.UUID;

public record PurchaseOrderApproveRequest(
        UUID ownerAccountId,
        String notes
) {
}
