package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.OrderCreateRequest;
import com.g127.snapbuy.dto.response.OrderResponse;
import com.g127.snapbuy.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<OrderResponse> createOrder(@RequestBody OrderCreateRequest req) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.createOrder(req));
        response.setMessage("Tạo đơn hàng thành công.");
        return response;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<OrderResponse> getOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.getOrder(id));
        response.setMessage("Lấy thông tin đơn hàng thành công.");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        ApiResponse<List<OrderResponse>> response = new ApiResponse<>();
        
        // Parse dates if provided
        LocalDateTime fromDate = null;
        LocalDateTime toDate = null;
        
        if (from != null && !from.trim().isEmpty()) {
            try {
                fromDate = LocalDate.parse(from).atStartOfDay();
            } catch (Exception e) {
                // Ignore parse errors
            }
        }
        
        if (to != null && !to.trim().isEmpty()) {
            try {
                toDate = LocalDate.parse(to).atTime(23, 59, 59);
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
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<Long> getMyTodayOrderCount(@RequestParam(required = false) String paymentStatus) {
        ApiResponse<Long> res = new ApiResponse<>();
        Long count = orderService.getMyTodayOrderCount(paymentStatus == null || paymentStatus.isBlank() ? null : paymentStatus.trim());
        res.setResult(count);
        res.setMessage("Lấy số đơn đã bán hôm nay thành công.");
        return res;
    }

    @GetMapping("/my/today-revenue")
    public ApiResponse<BigDecimal> getMyTodayRevenue(@RequestParam(required = false) String paymentStatus) {
        ApiResponse<BigDecimal> res = new ApiResponse<>();
        BigDecimal revenue = orderService.getMyTodayRevenue(paymentStatus == null || paymentStatus.isBlank() ? null : paymentStatus.trim());
        res.setResult(revenue);
        res.setMessage("Lấy doanh thu hôm nay thành công.");
        return res;
    }

    @GetMapping("/my/by-range")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<List<OrderResponse>> getMyOrdersByRange(@RequestParam String from,
                                                                         @RequestParam String to) {
        ApiResponse<List<OrderResponse>> res = new ApiResponse<>();
        LocalDateTime fromDt = parseFlexible(from);
        LocalDateTime toDt = parseFlexible(to);
        if (fromDt == null || toDt == null) {
            LocalDate today = LocalDate.now();
            fromDt = today.atStartOfDay();
            toDt = today.atTime(LocalTime.MAX);
        }
        res.setResult(orderService.getMyOrdersByDateTimeRange(fromDt, toDt));
        res.setMessage("Lấy đơn theo khoảng thời gian thành công.");
        return res;
    }

    private LocalDateTime parseFlexible(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDateTime.parse(s); } catch (Exception ignored) {}
        try { return OffsetDateTime.parse(s, DateTimeFormatter.ISO_DATE_TIME).toLocalDateTime(); } catch (Exception ignored) {}
        try { return LocalDateTime.ofInstant(Instant.parse(s), ZoneId.systemDefault()); } catch (Exception ignored) {}
        // Try trimming milliseconds and Z
        try {
            String t = s.replace("Z", "");
            int dot = t.indexOf('.');
            if (dot > 0) t = t.substring(0, dot);
            return LocalDateTime.parse(t);
        } catch (Exception ignored) {}
        return null;
    }

    @PostMapping("/{id}/hold")
    public ApiResponse<OrderResponse> holdOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.holdOrder(id));
        response.setMessage("Đã chuyển đơn hàng sang trạng thái chờ.");
        return response;
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<OrderResponse> completeOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.completeOrder(id));
        response.setMessage("Hoàn tất đơn hàng thành công.");
        return response;
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<OrderResponse> cancelOrder(@PathVariable UUID id) {
        ApiResponse<OrderResponse> response = new ApiResponse<>();
        response.setResult(orderService.cancelOrder(id));
        response.setMessage("Hủy đơn hàng thành công.");
        return response;
    }

    @GetMapping("/by-account/{accountId}/by-range")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<OrderResponse>> getOrdersByAccountAndRange(@PathVariable UUID accountId,
                                                                                @RequestParam String from,
                                                                                @RequestParam String to) {
        ApiResponse<List<OrderResponse>> res = new ApiResponse<>();
        LocalDateTime fromDt = parseFlexible(from);
        LocalDateTime toDt = parseFlexible(to);
        if (fromDt == null || toDt == null) {
            LocalDate today = LocalDate.now();
            fromDt = today.atStartOfDay();
            toDt = today.atTime(LocalTime.MAX);
        }
        res.setResult(orderService.getOrdersByAccountAndDateTimeRange(accountId, fromDt, toDt));
        res.setMessage("Lấy đơn theo khoảng thời gian thành công.");
        return res;
    }
}
