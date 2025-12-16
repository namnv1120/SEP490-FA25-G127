package com.g127.snapbuy.notification.service;

import com.g127.snapbuy.notification.dto.response.NotificationResponse;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.notification.entity.Notification.NotificationType;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {
    
    /**
     * Get all notifications with filters
     */
    PageResponse<NotificationResponse> getAllNotifications(
            Boolean isRead, NotificationType type, Pageable pageable);

    /**
     * Get unread count
     */
    Long getUnreadCount();

    /**
     * Mark notification as read
     */
    NotificationResponse markAsRead(UUID notificationId);

    /**
     * Mark all notifications as read
     */
    void markAllAsRead();

    /**
     * Delete notification
     */
    void deleteNotification(UUID notificationId);

    /**
     * Create notification for shop (internal use)
     */
    void createNotification(UUID shopId, NotificationType type,
                           String message, String description, UUID referenceId);

    /**
     * Create notification for specific account (internal use)
     */
    void createNotificationForAccount(UUID accountId, NotificationType type,
                           String message, String description, UUID referenceId);
}
