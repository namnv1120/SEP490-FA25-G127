package com.g127.snapbuy.payment.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    @NotNull(message = "Vui lòng chọn đơn hàng.")
    private UUID orderId;

    @NotBlank(message = "Vui lòng chọn phương thức thanh toán.")
    private String paymentMethod;

    @NotNull(message = "Vui lòng nhập số tiền.")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền phải lớn hơn 0.")
    private BigDecimal amount;

    private String transactionReference;

    private String paymentStatus;

    private String notes;
}
