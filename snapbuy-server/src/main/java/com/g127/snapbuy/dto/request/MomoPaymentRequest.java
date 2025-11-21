package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class MomoPaymentRequest {
    @NotNull
    private UUID orderId;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền phải lớn hơn 0.")
    private BigDecimal amount;

    @NotBlank
    private String orderInfo;

    @NotBlank
    private String returnUrl;

    @NotBlank
    private String notifyUrl;
}
