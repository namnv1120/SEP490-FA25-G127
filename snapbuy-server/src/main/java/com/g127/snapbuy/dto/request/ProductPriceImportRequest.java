package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductPriceImportRequest {

    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String productCode;

    @NotNull(message = "Giá bán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá bán phải lớn hơn 0")
    private BigDecimal unitPrice;

    @NotNull(message = "Giá nhập không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá nhập không được âm")
    private BigDecimal costPrice;
}

