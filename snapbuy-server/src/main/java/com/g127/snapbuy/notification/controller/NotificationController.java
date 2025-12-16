package com.g127.snapbuy.notification.controller;

import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.notification.dto.response.NotificationResponse;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.notification.entity.Notification.NotificationType;
import com.g127.snapbuy.notification.service.NotificationService;
import com.g127.snapbuy.notification.service.NotificationSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationSchedulerService notificationSchedulerService;

    /**
     * Get all notifications with optional filters
     * @param isRead Filter by read status
     * @param type Filter by notification type
     * @param page Page number (default: 0)
     * @param size Page size (default: 10)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho','Nhân viên bán hàng')")
    public ApiResponse<PageResponse<NotificationResponse>> getAllNotifications(
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) NotificationType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100)
        );

        ApiResponse<PageResponse<NotificationResponse>> response = new ApiResponse<>();
        response.setResult(notificationService.getAllNotifications(isRead, type, pageable));
        return response;
    }

    /**
     * Get unread notifications count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho','Nhân viên bán hàng')")
    public ApiResponse<Long> getUnreadCount() {
        ApiResponse<Long> response = new ApiResponse<>();
        response.setResult(notificationService.getUnreadCount());
        return response;
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho','Nhân viên bán hàng')")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable("id") UUID id) {
        ApiResponse<NotificationResponse> response = new ApiResponse<>();
        response.setResult(notificationService.markAsRead(id));
        return response;
    }

    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho','Nhân viên bán hàng')")
    public ApiResponse<String> markAllAsRead() {
        notificationService.markAllAsRead();
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Đã đánh dấu tất cả thông báo là đã đọc");
        return response;
    }

    /**
     * Delete a notification
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho','Nhân viên bán hàng')")
    public ApiResponse<String> deleteNotification(@PathVariable("id") UUID id) {
        notificationService.deleteNotification(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Thông báo đã được xóa");
        return response;
    }

    /**
     * Trigger low stock check manually (for testing) - No auth required for debugging
     */
    @PostMapping("/trigger/low-stock")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> triggerLowStockCheck() {
        ApiResponse<String> response = new ApiResponse<>();
        try {
            notificationSchedulerService.checkLowStock();
            response.setResult("Đã kiểm tra tồn kho thấp thành công");
            response.setMessage("Đã chạy kiểm tra tồn kho thấp");
        } catch (Exception e) {
            log.error("Error triggering low stock check: {}", e.getMessage(), e);
            response.setResult("Lỗi khi kiểm tra tồn kho thấp: " + e.getMessage());
        }
        return response;
    }

    /**
     * Debug endpoint - No auth required for testing
     */
    @GetMapping("/debug/low-stock")
    public ApiResponse<String> debugLowStock() {
        ApiResponse<String> response = new ApiResponse<>();
        try {
            notificationSchedulerService.checkLowStock();
            response.setResult("Đã chạy kiểm tra tồn kho thấp - Kiểm tra logs để xem chi tiết");
            response.setMessage("Success");
        } catch (Exception e) {
            log.error("Error in debug low stock: {}", e.getMessage(), e);
            response.setResult("Lỗi: " + e.getMessage());
            response.setMessage("Error");
        }
        return response;
    }

    /**
     * Debug endpoint for promotions - No auth required for testing
     */
    @GetMapping("/debug/promotions")
    public ApiResponse<String> debugPromotions() {
        ApiResponse<String> response = new ApiResponse<>();
        StringBuilder result = new StringBuilder();
        try {
            notificationSchedulerService.checkExpiringPromotions();
            result.append("✓ Kiểm tra khuyến mãi sắp hết hạn\n");
        } catch (Exception e) {
            result.append("✗ Lỗi: ").append(e.getMessage()).append("\n");
        }
        try {
            notificationSchedulerService.checkExpiredPromotions();
            result.append("✓ Kiểm tra khuyến mãi đã hết hạn");
        } catch (Exception e) {
            result.append("✗ Lỗi: ").append(e.getMessage());
        }
        response.setResult(result.toString());
        response.setMessage("Success");
        return response;
    }

    /**
     * Debug all notifications - No auth required for testing
     */
    @GetMapping("/debug/all")
    public ApiResponse<String> debugAll() {
        ApiResponse<String> response = new ApiResponse<>();
        StringBuilder result = new StringBuilder();
        try {
            notificationSchedulerService.checkLowStock();
            result.append("✓ Tồn kho thấp\n");
        } catch (Exception e) {
            result.append("✗ Tồn kho: ").append(e.getMessage()).append("\n");
        }
        try {
            notificationSchedulerService.checkExpiringPromotions();
            result.append("✓ Khuyến mãi sắp hết hạn\n");
        } catch (Exception e) {
            result.append("✗ KM sắp hết hạn: ").append(e.getMessage()).append("\n");
        }
        try {
            notificationSchedulerService.checkExpiredPromotions();
            result.append("✓ Khuyến mãi đã hết hạn");
        } catch (Exception e) {
            result.append("✗ KM đã hết hạn: ").append(e.getMessage());
        }
        response.setResult(result.toString());
        response.setMessage("Success");
        return response;
    }

    /**
     * Trigger expiring promotions check manually (for testing)
     */
    @PostMapping("/trigger/expiring-promotions")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> triggerExpiringPromotionsCheck() {
        ApiResponse<String> response = new ApiResponse<>();
        try {
            notificationSchedulerService.checkExpiringPromotions();
            response.setResult("Đã kiểm tra khuyến mãi sắp hết hạn thành công");
            response.setMessage("Đã chạy kiểm tra khuyến mãi sắp hết hạn");
        } catch (Exception e) {
            log.error("Error triggering expiring promotions check: {}", e.getMessage(), e);
            response.setResult("Lỗi khi kiểm tra khuyến mãi sắp hết hạn: " + e.getMessage());
        }
        return response;
    }

    /**
     * Trigger expired promotions check manually (for testing)
     */
    @PostMapping("/trigger/expired-promotions")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> triggerExpiredPromotionsCheck() {
        ApiResponse<String> response = new ApiResponse<>();
        try {
            notificationSchedulerService.checkExpiredPromotions();
            response.setResult("Đã kiểm tra khuyến mãi đã hết hạn thành công");
            response.setMessage("Đã chạy kiểm tra khuyến mãi đã hết hạn");
        } catch (Exception e) {
            log.error("Error triggering expired promotions check: {}", e.getMessage(), e);
            response.setResult("Lỗi khi kiểm tra khuyến mãi đã hết hạn: " + e.getMessage());
        }
        return response;
    }

    /**
     * Trigger all notification checks manually (for testing)
     */
    @PostMapping("/trigger/all")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> triggerAllChecks() {
        ApiResponse<String> response = new ApiResponse<>();
        StringBuilder result = new StringBuilder();

        try {
            notificationSchedulerService.checkLowStock();
            result.append("✓ Kiểm tra tồn kho thấp\n");
        } catch (Exception e) {
            log.error("Error in low stock check: {}", e.getMessage());
            result.append("✗ Lỗi kiểm tra tồn kho: ").append(e.getMessage()).append("\n");
        }

        try {
            notificationSchedulerService.checkExpiringPromotions();
            result.append("✓ Kiểm tra khuyến mãi sắp hết hạn\n");
        } catch (Exception e) {
            log.error("Error in expiring promotions check: {}", e.getMessage());
            result.append("✗ Lỗi kiểm tra khuyến mãi sắp hết hạn: ").append(e.getMessage()).append("\n");
        }

        try {
            notificationSchedulerService.checkExpiredPromotions();
            result.append("✓ Kiểm tra khuyến mãi đã hết hạn");
        } catch (Exception e) {
            log.error("Error in expired promotions check: {}", e.getMessage());
            result.append("✗ Lỗi kiểm tra khuyến mãi đã hết hạn: ").append(e.getMessage());
        }

        response.setResult(result.toString());
        response.setMessage("Đã chạy tất cả kiểm tra thông báo");
        return response;
    }

}
