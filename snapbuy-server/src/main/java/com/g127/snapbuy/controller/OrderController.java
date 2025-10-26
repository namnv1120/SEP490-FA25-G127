package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.OrderCreateRequest;
import com.g127.snapbuy.dto.response.OrderResponse;
import com.g127.snapbuy.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> createOrder(@RequestBody OrderCreateRequest req) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.createOrder(req));
        response.setMessage("Order created successfully");
        return response;
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.getOrder(id));
        response.setMessage("Order fetched successfully");
        return response;
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        ApiResponse<List<OrderResponse>> response = new ApiResponse<>();
        response.setResult(orderService.getAllOrders());
        response.setMessage("Orders fetched successfully");
        return response;
    }

    @PostMapping("/{id}/hold")
    public ApiResponse<OrderResponse> holdOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.holdOrder(id));
        response.setMessage("Order put on hold successfully");
        return response;
    }

    @PostMapping("/{id}/complete")
    public ApiResponse<OrderResponse> completeOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.completeOrder(id));
        response.setMessage("Order completed successfully");
        return response;
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.cancelOrder(id));
        response.setMessage("Order cancelled successfully");
        return response;
    }
}
