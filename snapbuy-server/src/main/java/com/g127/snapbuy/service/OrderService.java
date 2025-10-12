package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.*;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(OrderCreateRequest req);

    OrderResponse getOrder(UUID orderId);

    List<OrderResponse> getAllOrders();

    void cancelOrder(UUID orderId);

    void holdOrder(UUID id);

    void completeOrder(UUID id);
}
