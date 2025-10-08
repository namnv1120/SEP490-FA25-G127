package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.OrderCreateRequest;
import com.g127.snapbuy.dto.request.PaymentRequest;
import com.g127.snapbuy.dto.response.OrderResponse;
import com.g127.snapbuy.dto.response.PaymentResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(OrderCreateRequest req);

    OrderResponse getOrder(UUID orderId);

    List<OrderResponse> getAllOrders();

    PaymentResponse addPayment(PaymentRequest req);

    void cancelOrder(UUID orderId);
}
