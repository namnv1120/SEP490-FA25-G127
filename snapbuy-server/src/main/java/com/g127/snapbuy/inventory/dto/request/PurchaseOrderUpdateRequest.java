package com.g127.snapbuy.inventory.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderUpdateRequest {

    @NotEmpty
    private List<Item> items;
    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String notes;
    @PositiveOrZero
    private BigDecimal taxAmount;
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Item {
        @NotNull
        private UUID productId;
        @Positive
        private int quantity;
        @Positive
        private BigDecimal unitPrice;
        @Min(value = 0, message = "Số lượng thực nhận phải lớn hơn hoặc bằng 0")
        @PositiveOrZero(message = "Số lượng thực nhận phải lớn hơn hoặc bằng 0")
        private Integer receiveQuantity;
    }
}