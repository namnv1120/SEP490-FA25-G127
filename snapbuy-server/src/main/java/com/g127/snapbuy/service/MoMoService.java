package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.ApiResponse;

import java.util.UUID;

public interface MoMoService {
    ApiResponse<String> createPayment(UUID orderId);
    ApiResponse<String> handlePaymentResult(String resultCode, String orderId);
}
