package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.OrderCreateRequest;
import com.g127.snapbuy.dto.response.OrderResponse;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse createOrder(OrderCreateRequest req);
    OrderResponse getOrder(UUID id);
    List<OrderResponse> getAllOrders();
    List<OrderResponse> searchOrders(String searchTerm, String orderStatus, LocalDateTime fromDate, LocalDateTime toDate);
    OrderResponse holdOrder(UUID id);
    OrderResponse completeOrder(UUID id);
    OrderResponse cancelOrder(UUID id);
    void finalizePayment(UUID orderId);
    void finalizePaymentByReference(String transactionReference);
    void cancelOrderByReference(String transactionReference);
    Long getMyTodayOrderCount(String paymentStatus);
    BigDecimal getMyTodayRevenue(String paymentStatus);
    java.util.List<OrderResponse> getMyOrdersByDateTimeRange(java.time.LocalDateTime from, java.time.LocalDateTime to);
}
