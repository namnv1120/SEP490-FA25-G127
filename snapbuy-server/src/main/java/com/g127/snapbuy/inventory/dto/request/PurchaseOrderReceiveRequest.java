package com.g127.snapbuy.inventory.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
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
    @NotEmpty
    private List<Item> items = new ArrayList<>();
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String notes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        @NotNull
        private UUID purchaseOrderDetailId;

        @Min(value = 0, message = "Số lượng thực nhận phải lớn hơn hoặc bằng 0")
        @PositiveOrZero(message = "Số lượng thực nhận phải lớn hơn hoặc bằng 0")
        private int receivedQuantity;
    }
}
