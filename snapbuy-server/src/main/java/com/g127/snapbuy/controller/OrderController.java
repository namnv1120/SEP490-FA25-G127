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
    public ApiResponse<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        ApiResponse<List<OrderResponse>> response = new ApiResponse<>();
        
        // Parse dates if provided
        java.time.LocalDateTime fromDate = null;
        java.time.LocalDateTime toDate = null;
        
        if (from != null && !from.trim().isEmpty()) {
            try {
                fromDate = java.time.LocalDate.parse(from).atStartOfDay();
            } catch (Exception e) {
                // Ignore parse errors
            }
        }
        
        if (to != null && !to.trim().isEmpty()) {
            try {
                toDate = java.time.LocalDate.parse(to).atTime(23, 59, 59);
            } catch (Exception e) {
                // Ignore parse errors
            }
        }
        
        // If any search parameter is provided, use search method
        if (searchTerm != null || orderStatus != null || fromDate != null || toDate != null) {
            response.setResult(orderService.searchOrders(searchTerm, orderStatus, fromDate, toDate));
            response.setMessage("Tìm kiếm đơn hàng thành công.");
        } else {
            response.setResult(orderService.getAllOrders());
            response.setMessage("Lấy danh sách đơn hàng thành công.");
        }
        
        return response;
    }

    @GetMapping("/my/today-count")
    public ApiResponse<Long> getMyTodayOrderCount(@RequestParam(required = false) String paymentStatus) {
        ApiResponse<Long> res = new ApiResponse<>();
        Long count = orderService.getMyTodayOrderCount(paymentStatus == null || paymentStatus.isBlank() ? null : paymentStatus.trim());
        res.setResult(count);
        res.setMessage("Lấy số đơn đã bán hôm nay thành công.");
        return res;
    }

    @GetMapping("/my/today-revenue")
    public ApiResponse<java.math.BigDecimal> getMyTodayRevenue(@RequestParam(required = false) String paymentStatus) {
        ApiResponse<java.math.BigDecimal> res = new ApiResponse<>();
        java.math.BigDecimal revenue = orderService.getMyTodayRevenue(paymentStatus == null || paymentStatus.isBlank() ? null : paymentStatus.trim());
        res.setResult(revenue);
        res.setMessage("Lấy doanh thu hôm nay thành công.");
        return res;
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
