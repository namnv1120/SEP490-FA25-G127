package com.g127.snapbuy.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class MomoPaymentRequest {
    private UUID orderId;
    private BigDecimal amount;
    private String orderInfo;
    private String returnUrl;
    private String notifyUrl;
}
