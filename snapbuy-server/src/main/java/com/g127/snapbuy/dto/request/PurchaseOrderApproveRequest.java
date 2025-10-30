package com.g127.snapbuy.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderApproveRequest {
    private UUID ownerAccountId;
    private String notes;
}
