package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.PaymentRequest;
import com.g127.snapbuy.dto.response.PaymentResponse;

import java.util.List;
import java.util.UUID;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request);
    PaymentResponse finalizePayment(UUID paymentId);
    PaymentResponse refundPayment(UUID paymentId);
    List<PaymentResponse> getPaymentsByOrder(UUID orderId);
    void finalizePaymentByReference(String momoRequestId);
}
