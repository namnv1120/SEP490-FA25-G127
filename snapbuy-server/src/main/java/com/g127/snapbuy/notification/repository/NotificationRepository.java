package com.g127.snapbuy.notification.repository;

import com.g127.snapbuy.notification.entity.Notification;
import com.g127.snapbuy.notification.entity.Notification.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // Get all notifications for a shop with pagination
    Page<Notification> findByShopIdOrderByCreatedAtDesc(UUID shopId, Pageable pageable);

    // Get unread notifications
    Page<Notification> findByShopIdAndIsReadOrderByCreatedAtDesc(UUID shopId, Boolean isRead, Pageable pageable);

    // Get notifications by type
    Page<Notification> findByShopIdAndTypeOrderByCreatedAtDesc(UUID shopId, NotificationType type, Pageable pageable);

    // Get notifications by type and read status
    Page<Notification> findByShopIdAndTypeAndIsReadOrderByCreatedAtDesc(
            UUID shopId, NotificationType type, Boolean isRead, Pageable pageable);

    // Count unread notifications
    Long countByShopIdAndIsRead(UUID shopId, Boolean isRead);

    // Delete all notifications for a shop
    void deleteByShopId(UUID shopId);

    // Check if notification exists for a reference ID within time range (both read and unread)
    @Query("""
        select count(n) > 0 from Notification n
        where n.shopId = :shopId
          and n.type = :type
          and n.referenceId = :referenceId
          and n.createdAt >= :since
    """)
    boolean existsByShopIdAndTypeAndReferenceIdSince(
            @Param("shopId") UUID shopId,
            @Param("type") NotificationType type,
            @Param("referenceId") UUID referenceId,
            @Param("since") LocalDateTime since);

    // Check if unread notification exists for a reference ID
    @Query("""
        select count(n) > 0 from Notification n
        where n.shopId = :shopId
          and n.type = :type
          and n.referenceId = :referenceId
          and n.isRead = :isRead
    """)
    boolean existsByShopIdAndTypeAndReferenceIdAndIsRead(
            @Param("shopId") UUID shopId,
            @Param("type") NotificationType type,
            @Param("referenceId") UUID referenceId,
            @Param("isRead") Boolean isRead);

    // Find notifications by referenceId and type
    java.util.List<Notification> findByReferenceIdAndType(UUID referenceId, NotificationType type);

    // ============ Account-based notifications ============

    // Get all notifications for an account with pagination
    Page<Notification> findByAccountIdOrderByCreatedAtDesc(UUID accountId, Pageable pageable);

    // Get unread notifications for an account
    Page<Notification> findByAccountIdAndIsReadOrderByCreatedAtDesc(UUID accountId, Boolean isRead, Pageable pageable);

    // Get notifications by type for an account
    Page<Notification> findByAccountIdAndTypeOrderByCreatedAtDesc(UUID accountId, NotificationType type, Pageable pageable);

    // Get notifications by type and read status for an account
    Page<Notification> findByAccountIdAndTypeAndIsReadOrderByCreatedAtDesc(
            UUID accountId, NotificationType type, Boolean isRead, Pageable pageable);

    // Count unread notifications for an account
    Long countByAccountIdAndIsRead(UUID accountId, Boolean isRead);

    // Get all notifications for shop OR account (combined)
    @Query("""
        select n from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
        order by n.createdAt desc
    """)
    Page<Notification> findByShopIdOrAccountIdOrderByCreatedAtDesc(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId, Pageable pageable);

    // Get unread notifications for shop OR account
    @Query("""
        select n from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
          and n.isRead = :isRead
        order by n.createdAt desc
    """)
    Page<Notification> findByShopIdOrAccountIdAndIsReadOrderByCreatedAtDesc(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId,
            @Param("isRead") Boolean isRead, Pageable pageable);

    // Get notifications by type for shop OR account
    @Query("""
        select n from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
          and n.type = :type
        order by n.createdAt desc
    """)
    Page<Notification> findByShopIdOrAccountIdAndTypeOrderByCreatedAtDesc(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId,
            @Param("type") NotificationType type, Pageable pageable);

    // Get notifications by type and read status for shop OR account
    @Query("""
        select n from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
          and n.type = :type
          and n.isRead = :isRead
        order by n.createdAt desc
    """)
    Page<Notification> findByShopIdOrAccountIdAndTypeAndIsReadOrderByCreatedAtDesc(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId,
            @Param("type") NotificationType type, @Param("isRead") Boolean isRead, Pageable pageable);

    // Count unread notifications for shop OR account
    @Query("""
        select count(n) from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
          and n.isRead = :isRead
    """)
    Long countByShopIdOrAccountIdAndIsRead(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId,
            @Param("isRead") Boolean isRead);
}
