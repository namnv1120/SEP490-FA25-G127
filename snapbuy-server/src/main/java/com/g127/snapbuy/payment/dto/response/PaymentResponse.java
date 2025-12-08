package com.g127.snapbuy.payment.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private UUID paymentId;
    private String paymentMethod;
    private BigDecimal amount;
    private String paymentStatus;
    private String transactionReference;
    private String notes;
    private LocalDateTime paymentDate;
    private String payUrl;
}
