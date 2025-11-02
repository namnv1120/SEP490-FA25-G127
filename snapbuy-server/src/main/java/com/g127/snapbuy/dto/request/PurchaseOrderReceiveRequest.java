package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderReceiveRequest {

    private List<Item> items = new ArrayList<>();
    private String notes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        @NotNull
        private UUID purchaseOrderDetailId;

        @PositiveOrZero
        private int receivedQuantity;
    }
}
