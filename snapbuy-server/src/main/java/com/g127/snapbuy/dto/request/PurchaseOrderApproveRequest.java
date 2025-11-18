package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderApproveRequest {
    @NotNull
    private UUID ownerAccountId;

    @Size(max = 1000)
    private String notes;
}
