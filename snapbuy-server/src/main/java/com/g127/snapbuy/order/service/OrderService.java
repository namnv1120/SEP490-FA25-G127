package com.g127.snapbuy.order.service;

import com.g127.snapbuy.order.dto.request.OrderCreateRequest;
import com.g127.snapbuy.order.dto.response.OrderResponse;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse createOrder(OrderCreateRequest req);
    OrderResponse getOrder(UUID id);
    List<OrderResponse> getAllOrders();
    List<OrderResponse> searchOrders(String searchTerm, String orderStatus, LocalDateTime fromDate, LocalDateTime toDate);
    List<OrderResponse> searchReturnOrders(String searchTerm, String orderStatus, LocalDateTime fromDate, LocalDateTime toDate);
    OrderResponse completeOrder(UUID id);
    OrderResponse cancelOrder(UUID id);
    OrderResponse markForReturn(UUID id);
    OrderResponse revertReturnStatus(UUID id);
    void finalizePayment(UUID orderId);
    void finalizePaymentByReference(String transactionReference);
    void cancelOrderByReference(String transactionReference);
    Long getMyTodayOrderCount(String paymentStatus);
    BigDecimal getMyTodayRevenue(String paymentStatus);
    java.util.List<OrderResponse> getMyOrdersByDateTimeRange(java.time.LocalDateTime from, java.time.LocalDateTime to);
    java.util.List<OrderResponse> getOrdersByAccountAndDateTimeRange(java.util.UUID accountId, java.time.LocalDateTime from, java.time.LocalDateTime to);
}
