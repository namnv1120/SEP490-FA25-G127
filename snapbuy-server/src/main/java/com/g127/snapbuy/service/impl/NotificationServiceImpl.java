package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.response.NotificationResponse;
import com.g127.snapbuy.dto.response.PageResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.Notification;
import com.g127.snapbuy.entity.Notification.NotificationType;
import com.g127.snapbuy.mapper.NotificationMapper;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.NotificationRepository;
import com.g127.snapbuy.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final AccountRepository accountRepository;

    @Override
    public PageResponse<NotificationResponse> getAllNotifications(
            Boolean isRead, NotificationType type, Pageable pageable) {

        UUID shopId = getShopIdFromAuth();
        UUID accountId = getCurrentAccountId();
        Page<Notification> notificationPage;

        // Lấy thông báo theo cả shopId (thông báo chung) và accountId (thông báo cá nhân)
        if (type != null && isRead != null) {
            notificationPage = notificationRepository
                    .findByShopIdOrAccountIdAndTypeAndIsReadOrderByCreatedAtDesc(shopId, accountId, type, isRead, pageable);
        } else if (type != null) {
            notificationPage = notificationRepository
                    .findByShopIdOrAccountIdAndTypeOrderByCreatedAtDesc(shopId, accountId, type, pageable);
        } else if (isRead != null) {
            notificationPage = notificationRepository
                    .findByShopIdOrAccountIdAndIsReadOrderByCreatedAtDesc(shopId, accountId, isRead, pageable);
        } else {
            notificationPage = notificationRepository
                    .findByShopIdOrAccountIdOrderByCreatedAtDesc(shopId, accountId, pageable);
        }

        List<NotificationResponse> notifications = notificationPage.getContent()
                .stream()
                .map(notificationMapper::toResponse)
                .toList();

        return PageResponse.<NotificationResponse>builder()
                .content(notifications)
                .number(notificationPage.getNumber())
                .totalPages(notificationPage.getTotalPages())
                .totalElements(notificationPage.getTotalElements())
                .size(notificationPage.getSize())
                .first(notificationPage.isFirst())
                .last(notificationPage.isLast())
                .empty(notificationPage.isEmpty())
                .build();
    }

    @Override
    public Long getUnreadCount() {
        UUID shopId = getShopIdFromAuth();
        UUID accountId = getCurrentAccountId();
        return notificationRepository.countByShopIdOrAccountIdAndIsRead(shopId, accountId, false);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Verify ownership - kiểm tra cả shopId và accountId
        UUID shopId = getShopIdFromAuth();
        UUID accountId = getCurrentAccountId();
        boolean isAuthorized =
            (notification.getShopId() != null && notification.getShopId().equals(shopId)) ||
            (notification.getAccountId() != null && notification.getAccountId().equals(accountId));

        if (!isAuthorized) {
            throw new RuntimeException("Unauthorized access");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        UUID shopId = getShopIdFromAuth();
        UUID accountId = getCurrentAccountId();

        // Lấy tất cả thông báo chưa đọc của shop hoặc account
        Page<Notification> unreadNotifications = notificationRepository
                .findByShopIdOrAccountIdAndIsReadOrderByCreatedAtDesc(shopId, accountId, false, Pageable.unpaged());

        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications.getContent());
    }

    @Override
    @Transactional
    public void deleteNotification(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Verify ownership - kiểm tra cả shopId và accountId
        UUID shopId = getShopIdFromAuth();
        UUID accountId = getCurrentAccountId();
        boolean isAuthorized =
            (notification.getShopId() != null && notification.getShopId().equals(shopId)) ||
            (notification.getAccountId() != null && notification.getAccountId().equals(accountId));

        if (!isAuthorized) {
            throw new RuntimeException("Unauthorized access");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void createNotification(UUID shopId, NotificationType type, 
                                   String message, String description, UUID referenceId) {
        try {
            if (shopId == null) {
                log.error("Cannot create notification: shopId is null");
                throw new IllegalArgumentException("Shop ID cannot be null");
            }
            
            if (type == null) {
                log.error("Cannot create notification: type is null");
                throw new IllegalArgumentException("Notification type cannot be null");
            }
            
            log.info("Bắt đầu tạo thông báo - Shop ID: {}, Type: {}, Message: {}", shopId, type, message);
            
            Notification notification = Notification.builder()
                    .shopId(shopId)
                    .type(type)
                    .message(message)
                    .description(description)
                    .referenceId(referenceId)
                    .isRead(false)
                    .build();

            log.info("Notification object created: {}", notification);
            
            Notification saved = notificationRepository.save(notification);
            notificationRepository.flush(); // Force immediate write to database
            
            log.info("Created notification successfully - ID: {}, shop: {}, type: {}, message: {}", 
                    saved.getId(), shopId, type, message);
        } catch (Exception e) {
            log.error("Error creating notification for shop: {}, type: {}, message: {}", 
                    shopId, type, message, e);
            log.error("Exception details: {}", e.getClass().getName());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            throw e;
        }
    }

    @Override
    @Transactional
    public void createNotificationForAccount(UUID accountId, NotificationType type,
                                   String message, String description, UUID referenceId) {
        try {
            if (accountId == null) {
                log.error("Cannot create notification: accountId is null");
                throw new IllegalArgumentException("Account ID cannot be null");
            }

            if (type == null) {
                log.error("Cannot create notification: type is null");
                throw new IllegalArgumentException("Notification type cannot be null");
            }

            log.info("Bắt đầu tạo thông báo cho account - Account ID: {}, Type: {}, Message: {}", accountId, type, message);

            Notification notification = Notification.builder()
                    .accountId(accountId)
                    .type(type)
                    .message(message)
                    .description(description)
                    .referenceId(referenceId)
                    .isRead(false)
                    .build();

            log.info("Notification object created for account: {}", notification);

            Notification saved = notificationRepository.save(notification);
            notificationRepository.flush(); // Force immediate write to database

            log.info("Created notification successfully - ID: {}, account: {}, type: {}, message: {}",
                    saved.getId(), accountId, type, message);
        } catch (Exception e) {
            log.error("Error creating notification for account: {}, type: {}, message: {}",
                    accountId, type, message, e);
            log.error("Exception details: {}", e.getClass().getName());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
            }
            throw e;
        }
    }

    /**
     * Get shop ID from authenticated user
     * In this single-tenant system, we use the shop owner's account ID as the shop ID
     * All users in the system belong to the same shop (single-tenant)
     */
    private UUID getShopIdFromAuth() {
        try {
            // In single-tenant system, all users belong to the same shop
            // Get the first shop owner's ID as the shop ID
            List<Account> shopOwners = accountRepository.findByRoleName("Chủ cửa hàng");
            if (shopOwners != null && !shopOwners.isEmpty()) {
                UUID shopId = shopOwners.get(0).getAccountId();
                log.debug("Using shop owner ID as shop ID: {}", shopId);
                return shopId;
            }

            // Fallback: use current user's account ID
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                String username = auth.getName();
                UUID accountId = accountRepository.findByUsername(username)
                        .map(Account::getAccountId)
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + username));
                log.debug("Using current user account ID as shop ID: {}", accountId);
                return accountId;
            }

            throw new NoSuchElementException("Không xác định được shop ID - Vui lòng đăng nhập");
        } catch (NoSuchElementException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error getting shop ID: {}", e.getMessage(), e);
            throw new IllegalStateException("Không thể xác định shop ID: " + e.getMessage());
        }
    }

    /**
     * Get current user's account ID from authentication
     */
    private UUID getCurrentAccountId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                String username = auth.getName();
                return accountRepository.findByUsername(username)
                        .map(Account::getAccountId)
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + username));
            }
            throw new NoSuchElementException("Không xác định được account ID - Vui lòng đăng nhập");
        } catch (NoSuchElementException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error getting current account ID: {}", e.getMessage(), e);
            throw new IllegalStateException("Không thể xác định account ID: " + e.getMessage());
        }
    }
}
