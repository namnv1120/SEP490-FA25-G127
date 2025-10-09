package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.OrderCreateRequest;
import com.g127.snapbuy.dto.response.OrderResponse;
import com.g127.snapbuy.service.OrderService;
import jakarta.validation.Valid;
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
    public ApiResponse<OrderResponse> createOrder(@RequestBody @Valid OrderCreateRequest request) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.createOrder(request));
        return response;
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        ApiResponse<List<OrderResponse>> response = new ApiResponse<>();
        response.setResult(orderService.getAllOrders());
        return response;
    }

    @GetMapping("{id}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable("id") UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.getOrder(id));
        return response;
    }

    @PutMapping("{id}/cancel")
    public ApiResponse<String> cancelOrder(@PathVariable("id") UUID id) {
        orderService.cancelOrder(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Order canceled successfully");
        return response;
    }

    @PutMapping("{id}/hold")
    public ApiResponse<String> holdOrder(@PathVariable("id") UUID id) {
        orderService.holdOrder(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Order placed on hold");
        return response;
    }

    @PutMapping("{id}/complete")
    public ApiResponse<String> completeOrder(@PathVariable("id") UUID id) {
        orderService.completeOrder(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Order completed successfully");
        return response;
    }
}
