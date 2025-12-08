package com.g127.snapbuy.inventory.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class InventoryUpdateRequest {

    @Min(value = 0, message = "Số lượng tồn phải lớn hơn hoặc bằng 0.")
    private Integer quantityInStock;

    @Min(value = 0, message = "Tồn tối thiểu phải lớn hơn hoặc bằng 0.")
    private Integer minimumStock;

    @Min(value = 0, message = "Tồn tối đa phải lớn hơn hoặc bằng 0.")
    private Integer maximumStock;

    @Min(value = 0, message = "Điểm đặt hàng lại phải lớn hơn hoặc bằng 0.")
    private Integer reorderPoint;
}
