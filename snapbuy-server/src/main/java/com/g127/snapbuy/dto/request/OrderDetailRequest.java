package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailRequest {

    @NotNull(message = "Vui lòng chọn sản phẩm.")
    private UUID productId;

    @NotNull(message = "Vui lòng nhập số lượng.")
    @Min(value = 1, message = "Số lượng phải ít nhất là 1.")
    private Integer quantity;

    @NotNull(message = "Vui lòng nhập đơn giá.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Đơn giá phải lớn hơn 0.")
    private BigDecimal unitPrice;

    @DecimalMin(value = "0.0", message = "Giảm giá không được âm.")
    private BigDecimal discount;
}
