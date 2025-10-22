package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.MomoPaymentResponse;
import java.util.UUID;

public interface MoMoService {
    MomoPaymentResponse createPayment(UUID orderId);
}
