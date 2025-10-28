package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class InventoryCreateRequest {

    @NotNull(message = "Vui lòng chọn sản phẩm.")
    private UUID productId;

    @NotNull(message = "Vui lòng nhập số lượng tồn.")
    @Min(value = 0, message = "Số lượng tồn phải lớn hơn hoặc bằng 0.")
    private Integer quantityInStock;

    @Min(value = 0, message = "Tồn tối thiểu phải lớn hơn hoặc bằng 0.")
    private Integer minimumStock;

    @Min(value = 0, message = "Tồn tối đa phải lớn hơn hoặc bằng 0.")
    private Integer maximumStock;

    @Min(value = 0, message = "Điểm đặt hàng lại phải lớn hơn hoặc bằng 0.")
    private Integer reorderPoint;
}
