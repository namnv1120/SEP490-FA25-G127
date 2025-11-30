package com.g127.snapbuy.service;

import java.util.UUID;

/**
 * Service interface for scheduled notification tasks
 */
public interface NotificationSchedulerService {

    /**
     * Check for low stock items and create notifications
     * This method is scheduled to run periodically
     */
    void checkLowStock();

    /**
     * Check for expiring promotions and create notifications
     * This method is scheduled to run periodically
     */
    void checkExpiringPromotions();

    /**
     * Check for expired promotions and create notifications
     * This method is scheduled to run periodically
     */
    void checkExpiredPromotions();

    /**
     * Schedule real-time notifications for a promotion
     * - 1 day before expiry: "Khuyến mãi sắp hết hạn"
     * - At exact expiry time: "Khuyến mãi đã hết hạn"
     */
    void schedulePromotionNotifications(UUID promotionId);

    /**
     * Cancel scheduled notifications for a promotion
     * Called when promotion is deleted or deactivated
     */
    void cancelPromotionNotifications(UUID promotionId);
}



