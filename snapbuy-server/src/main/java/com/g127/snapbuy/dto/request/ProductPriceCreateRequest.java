package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceCreateRequest {

    @NotNull(message = "Vui lòng chọn sản phẩm.")
    private UUID productId;

    @NotNull(message = "Vui lòng nhập đơn giá.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Đơn giá phải lớn hơn 0.")
    private BigDecimal unitPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá vốn không được âm.")
    private BigDecimal costPrice;

//    private LocalDateTime validFrom;
//    private LocalDateTime validTo;
}
