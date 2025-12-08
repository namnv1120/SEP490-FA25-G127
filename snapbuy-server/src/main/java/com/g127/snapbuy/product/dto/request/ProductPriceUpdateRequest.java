package com.g127.snapbuy.product.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceUpdateRequest {

    @NotNull(message = "Vui lòng nhập đơn giá.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Đơn giá phải lớn hơn 0.")
    private BigDecimal unitPrice;

    @NotNull(message = "Vui lòng nhập giá vốn.")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá vốn không được âm.")
    private BigDecimal costPrice;

}
