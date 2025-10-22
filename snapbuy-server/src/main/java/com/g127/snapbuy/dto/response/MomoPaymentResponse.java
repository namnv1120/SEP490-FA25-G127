package com.g127.snapbuy.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomoPaymentResponse {
    private String requestId;
    private String orderId;
    private String payUrl;
    private long amount;
    private String deeplink;
    private String message;
    private String resultCode;
}
