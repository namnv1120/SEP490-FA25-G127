package com.g127.snapbuy.dto.response;

import lombok.Data;

@Data
public class PosOrderResponse {
    private String orderNumber;
    private double totalAmount;
    private String paymentMethod;
    private String message;
}
