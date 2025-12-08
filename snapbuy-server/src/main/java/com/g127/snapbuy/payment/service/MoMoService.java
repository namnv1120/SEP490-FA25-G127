package com.g127.snapbuy.payment.service;

import com.g127.snapbuy.payment.dto.response.MomoPaymentResponse;
import java.util.UUID;

public interface MoMoService {
    MomoPaymentResponse createPayment(UUID orderId);
}
