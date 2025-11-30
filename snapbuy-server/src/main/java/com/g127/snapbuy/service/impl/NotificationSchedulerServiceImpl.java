package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.Inventory;
import com.g127.snapbuy.entity.Notification.NotificationType;
import com.g127.snapbuy.entity.Promotion;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.InventoryRepository;
import com.g127.snapbuy.repository.NotificationRepository;
import com.g127.snapbuy.repository.PromotionRepository;
import com.g127.snapbuy.service.NotificationService;
import com.g127.snapbuy.service.NotificationSchedulerService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
@Slf4j
public class NotificationSchedulerServiceImpl implements NotificationSchedulerService {

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    private final InventoryRepository inventoryRepository;
    private final PromotionRepository promotionRepository;
    private final AccountRepository accountRepository;
    private final TaskScheduler taskScheduler;

    // Track last notified quantity per product (productId -> quantity)
    // Key format: "productId_date" to auto-reset daily
    private final ConcurrentHashMap<String, Integer> lastNotifiedQuantityMap = new ConcurrentHashMap<>();

    // Store scheduled tasks: promotionId -> [expiringTask, expiredTask]
    private final Map<UUID, ScheduledFuture<?>[]> scheduledTasks = new ConcurrentHashMap<>();

    public NotificationSchedulerServiceImpl(
            NotificationService notificationService,
            NotificationRepository notificationRepository,
            InventoryRepository inventoryRepository,
            PromotionRepository promotionRepository,
            AccountRepository accountRepository) {
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
        this.inventoryRepository = inventoryRepository;
        this.promotionRepository = promotionRepository;
        this.accountRepository = accountRepository;

        // Create TaskScheduler
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("promo-notif-");
        scheduler.initialize();
        this.taskScheduler = scheduler;
    }

    @PostConstruct
    public void init() {
        rescheduleAllPromotionNotifications();
    }

    /**
     * Reschedule all promotion notifications on server startup
     */
    private void rescheduleAllPromotionNotifications() {
        log.info("Bắt đầu lên lịch lại tất cả thông báo khuyến mãi...");
        List<Promotion> activePromotions = promotionRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .filter(p -> p.getEndDate().isAfter(LocalDateTime.now()))
                .toList();

        for (Promotion promotion : activePromotions) {
            schedulePromotionNotifications(promotion.getPromotionId());
        }
        log.info("Đã lên lịch thông báo cho {} khuyến mãi", activePromotions.size());
    }

    /**
     * Check for low stock items and create notifications
     * Runs once daily at 8:00 AM
     *
     * Logic:
     * - Thông báo khi tồn kho <= điểm đặt hàng lại (reorderPoint)
     * - Thông báo lại mỗi khi số lượng tồn kho GIẢM (do order)
     * - Mỗi ngày chỉ thông báo 1 lần cho mỗi mức số lượng
     */
    @Override
    @Scheduled(cron = "0 0 8 * * *") // Run daily at 8:00 AM
    @Transactional
    public void checkLowStock() {
        try {
            List<UUID> shopIds = getAllShopIds();
            if (shopIds.isEmpty()) {
                log.warn("Cannot check low stock: No shop owners found");
                return;
            }

            List<Inventory> inventories = inventoryRepository.findAll();
            log.info("Bắt đầu kiểm tra tồn kho thấp. Tổng số inventory: {}, Số shop: {}", inventories.size(), shopIds.size());
            int notificationCount = 0;
            int checkedCount = 0;
            int skippedCount = 0;

            // Get today's date for tracking key
            String today = LocalDate.now().toString();

            for (Inventory inventory : inventories) {
                if (inventory.getProduct() == null ||
                    (inventory.getProduct().getActive() != null && !inventory.getProduct().getActive())) {
                    skippedCount++;
                    continue;
                }

                checkedCount++;
                UUID productId = inventory.getProduct().getProductId();
                Integer quantity = inventory.getQuantityInStock() != null ? inventory.getQuantityInStock() : 0;
                Integer reorderPoint = inventory.getReorderPoint();

                log.debug("Kiểm tra sản phẩm: {}, Số lượng: {}, Điểm đặt hàng: {}",
                        inventory.getProduct().getProductName(), quantity, reorderPoint);

                // Chỉ xử lý khi có reorderPoint hợp lệ và quantity <= reorderPoint
                if (reorderPoint == null || reorderPoint <= 0 || quantity > reorderPoint) {
                    continue;
                }

                // Tracking key: productId_date (auto-reset daily)
                String trackingKey = productId.toString() + "_" + today;
                Integer lastNotifiedQty = lastNotifiedQuantityMap.get(trackingKey);

                // Thông báo nếu:
                // 1. Chưa có thông báo trong ngày (lastNotifiedQty == null)
                // 2. Hoặc số lượng đã giảm so với lần thông báo trước (quantity < lastNotifiedQty)
                boolean shouldNotify = (lastNotifiedQty == null) || (quantity < lastNotifiedQty);

                if (!shouldNotify) {
                    log.debug("Bỏ qua sản phẩm {} - đã thông báo với số lượng {} (hiện tại: {})",
                            inventory.getProduct().getProductName(), lastNotifiedQty, quantity);
                    continue;
                }

                // Build notification message
                String message;
                String description;
                if (quantity <= 0) {
                    message = "Hết hàng: " + inventory.getProduct().getProductName();
                    description = String.format("Sản phẩm '%s' đã hết hàng (điểm đặt hàng: %d)",
                            inventory.getProduct().getProductName(), reorderPoint);
                } else {
                    message = "Cần đặt hàng lại: " + inventory.getProduct().getProductName();
                    description = String.format("Sản phẩm '%s' còn %d sản phẩm (điểm đặt hàng: %d)",
                            inventory.getProduct().getProductName(), quantity, reorderPoint);
                }

                // Create notification for all shop owners
                for (UUID shopId : shopIds) {
                    try {
                        notificationService.createNotification(
                                shopId,
                                NotificationType.TON_KHO_THAP,
                                message,
                                description,
                                productId
                        );
                        notificationCount++;
                        log.info("Đã tạo thông báo tồn kho thấp cho shop {} - sản phẩm: {}, số lượng: {}",
                                shopId, inventory.getProduct().getProductName(), quantity);
                    } catch (Exception e) {
                        log.error("Lỗi khi tạo thông báo cho sản phẩm {}: {}",
                                inventory.getProduct().getProductName(), e.getMessage());
                    }
                }

                // Update tracking map với số lượng đã thông báo
                lastNotifiedQuantityMap.put(trackingKey, quantity);
            }

            // Clean up old tracking keys (from previous days)
            cleanupOldTrackingKeys(today);

            log.info("Kết thúc kiểm tra tồn kho thấp. Đã kiểm tra: {}, Bỏ qua: {}, Tạo thông báo: {}",
                    checkedCount, skippedCount, notificationCount);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra tồn kho thấp: {}", e.getMessage(), e);
        }
    }

    /**
     * Remove tracking keys from previous days to prevent memory leak
     */
    private void cleanupOldTrackingKeys(String today) {
        lastNotifiedQuantityMap.keySet().removeIf(key -> !key.endsWith("_" + today));
    }

    /**
     * DEPRECATED: Now using real-time scheduling via schedulePromotionNotifications()
     * This method is kept for interface compatibility but does nothing
     */
    @Override
    public void checkExpiringPromotions() {
        // Real-time scheduling is handled by schedulePromotionNotifications()
        log.debug("checkExpiringPromotions called - using real-time scheduling instead");
    }

    /**
     * DEPRECATED: Now using real-time scheduling via schedulePromotionNotifications()
     * This method is kept for interface compatibility but does nothing
     */
    @Override
    public void checkExpiredPromotions() {
        // Real-time scheduling is handled by schedulePromotionNotifications()
        log.debug("checkExpiredPromotions called - using real-time scheduling instead");
    }

    /**
     * Schedule real-time notifications for a promotion
     * - 1 day before expiry: "Khuyến mãi sắp hết hạn"
     * - At exact expiry time: "Khuyến mãi đã hết hạn"
     */
    @Override
    public void schedulePromotionNotifications(UUID promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId).orElse(null);
        if (promotion == null) {
            log.warn("Không tìm thấy khuyến mãi: {}", promotionId);
            return;
        }

        // Cancel existing schedules first
        cancelPromotionNotifications(promotionId);

        // Mark old notifications as read so new ones can be created when expiry time changes
        markOldPromotionNotificationsAsRead(promotionId);

        // Don't schedule if promotion is inactive
        if (!Boolean.TRUE.equals(promotion.getActive())) {
            log.info("Khuyến mãi {} không hoạt động, bỏ qua lên lịch", promotion.getPromotionName());
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = promotion.getEndDate();
        LocalDateTime oneDayBefore = endDate.minusDays(1);

        ScheduledFuture<?>[] tasks = new ScheduledFuture<?>[2];

        // Schedule "sắp hết hạn" notification (1 day before)
        if (oneDayBefore.isAfter(now)) {
            Instant expiringTime = oneDayBefore.atZone(ZoneId.systemDefault()).toInstant();
            tasks[0] = taskScheduler.schedule(
                () -> createExpiringNotification(promotionId),
                expiringTime
            );
            log.info("Lên lịch 'sắp hết hạn' cho '{}' vào {}", promotion.getPromotionName(), oneDayBefore);
        }

        // Schedule "đã hết hạn" notification (at exact expiry time)
        if (endDate.isAfter(now)) {
            Instant expiredTime = endDate.atZone(ZoneId.systemDefault()).toInstant();
            tasks[1] = taskScheduler.schedule(
                () -> createExpiredNotification(promotionId),
                expiredTime
            );
            log.info("Lên lịch 'đã hết hạn' cho '{}' vào {}", promotion.getPromotionName(), endDate);
        }

        scheduledTasks.put(promotionId, tasks);
    }

    /**
     * Mark old promotion notifications as read to allow new ones to be created
     */
    private void markOldPromotionNotificationsAsRead(UUID promotionId) {
        try {
            // Mark "sắp hết hạn" notifications as read
            var expiringNotifs = notificationRepository.findByReferenceIdAndType(
                    promotionId, NotificationType.KHUYEN_MAI_SAP_HET_HAN);
            for (var notif : expiringNotifs) {
                if (!Boolean.TRUE.equals(notif.getIsRead())) {
                    notif.setIsRead(true);
                    notificationRepository.save(notif);
                }
            }

            // Mark "đã hết hạn" notifications as read
            var expiredNotifs = notificationRepository.findByReferenceIdAndType(
                    promotionId, NotificationType.KHUYEN_MAI_HET_HAN);
            for (var notif : expiredNotifs) {
                if (!Boolean.TRUE.equals(notif.getIsRead())) {
                    notif.setIsRead(true);
                    notificationRepository.save(notif);
                }
            }

            log.info("Đã đánh dấu đã đọc các thông báo cũ cho khuyến mãi: {}", promotionId);
        } catch (Exception e) {
            log.error("Lỗi khi đánh dấu thông báo đã đọc: {}", e.getMessage());
        }
    }

    /**
     * Cancel scheduled notifications for a promotion
     */
    @Override
    public void cancelPromotionNotifications(UUID promotionId) {
        ScheduledFuture<?>[] tasks = scheduledTasks.remove(promotionId);
        if (tasks != null) {
            for (ScheduledFuture<?> task : tasks) {
                if (task != null && !task.isDone()) {
                    task.cancel(false);
                }
            }
            log.info("Đã hủy lịch thông báo cho khuyến mãi: {}", promotionId);
        }
    }

    /**
     * Create "sắp hết hạn" notification (1 day before)
     */
    private void createExpiringNotification(UUID promotionId) {
        try {
            Promotion promotion = promotionRepository.findById(promotionId).orElse(null);
            if (promotion == null || !Boolean.TRUE.equals(promotion.getActive())) {
                return;
            }

            List<UUID> shopIds = getAllShopIds();
            String message = "Khuyến mãi sắp hết hạn: " + promotion.getPromotionName();
            String description = String.format("Khuyến mãi '%s' sẽ hết hạn vào ngày mai (%s)",
                    promotion.getPromotionName(), promotion.getEndDate().toLocalDate());

            for (UUID shopId : shopIds) {
                boolean exists = notificationRepository.existsByShopIdAndTypeAndReferenceIdAndIsRead(
                        shopId, NotificationType.KHUYEN_MAI_SAP_HET_HAN, promotionId, false);
                if (!exists) {
                    notificationService.createNotification(shopId, NotificationType.KHUYEN_MAI_SAP_HET_HAN,
                            message, description, promotionId);
                }
            }
            log.info("Đã tạo thông báo 'sắp hết hạn' cho: {}", promotion.getPromotionName());
        } catch (Exception e) {
            log.error("Lỗi tạo thông báo sắp hết hạn: {}", e.getMessage(), e);
        }
    }

    /**
     * Create "đã hết hạn" notification (at exact expiry time)
     */
    private void createExpiredNotification(UUID promotionId) {
        try {
            Promotion promotion = promotionRepository.findById(promotionId).orElse(null);
            if (promotion == null || !Boolean.TRUE.equals(promotion.getActive())) {
                return;
            }

            List<UUID> shopIds = getAllShopIds();
            String message = "Khuyến mãi đã hết hạn: " + promotion.getPromotionName();
            String description = String.format("Khuyến mãi '%s' đã hết hạn. Vui lòng kiểm tra và cập nhật.",
                    promotion.getPromotionName());

            for (UUID shopId : shopIds) {
                boolean exists = notificationRepository.existsByShopIdAndTypeAndReferenceIdAndIsRead(
                        shopId, NotificationType.KHUYEN_MAI_HET_HAN, promotionId, false);
                if (!exists) {
                    notificationService.createNotification(shopId, NotificationType.KHUYEN_MAI_HET_HAN,
                            message, description, promotionId);
                }
            }
            log.info("Đã tạo thông báo 'đã hết hạn' cho: {}", promotion.getPromotionName());
        } catch (Exception e) {
            log.error("Lỗi tạo thông báo hết hạn: {}", e.getMessage(), e);
        }
    }

    /**
     * Get all shop owner IDs
     */
    private List<UUID> getAllShopIds() {
        try {
            List<Account> shopOwners = accountRepository.findByRoleName("Chủ cửa hàng");
            if (shopOwners != null && !shopOwners.isEmpty()) {
                return shopOwners.stream()
                        .map(Account::getAccountId)
                        .toList();
            }
            return List.of();
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách shop ID: {}", e.getMessage());
            return List.of();
        }
    }
}

