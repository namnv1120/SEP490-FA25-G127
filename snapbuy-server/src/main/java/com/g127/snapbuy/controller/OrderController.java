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
        response.setMessage("Tạo đơn hàng thành công.");
        return response;
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.getOrder(id));
        response.setMessage("Lấy thông tin đơn hàng thành công.");
        return response;
    }

    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        ApiResponse<List<OrderResponse>> response = new ApiResponse<>();
        response.setResult(orderService.getAllOrders());
        response.setMessage("Lấy danh sách đơn hàng thành công.");
        return response;
    }

    @PostMapping("/{id}/hold")
    public ApiResponse<OrderResponse> holdOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.holdOrder(id));
        response.setMessage("Đã chuyển đơn hàng sang trạng thái chờ.");
        return response;
    }

    @PostMapping("/{id}/complete")
    public ApiResponse<OrderResponse> completeOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.completeOrder(id));
        response.setMessage("Hoàn tất đơn hàng thành công.");
        return response;
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.cancelOrder(id));
        response.setMessage("Hủy đơn hàng thành công.");
        return response;
    }
}
