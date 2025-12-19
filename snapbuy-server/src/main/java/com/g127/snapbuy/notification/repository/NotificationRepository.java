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

    // Lấy tất cả thông báo cho cửa hàng với phân trang
    Page<Notification> findByShopIdOrderByCreatedAtDesc(UUID shopId, Pageable pageable);

    // Lấy thông báo chưa đọc
    Page<Notification> findByShopIdAndIsReadOrderByCreatedAtDesc(UUID shopId, Boolean isRead, Pageable pageable);

    // Lấy thông báo theo loại
    Page<Notification> findByShopIdAndTypeOrderByCreatedAtDesc(UUID shopId, NotificationType type, Pageable pageable);

    // Lấy thông báo theo loại và trạng thái đọc
    Page<Notification> findByShopIdAndTypeAndIsReadOrderByCreatedAtDesc(
            UUID shopId, NotificationType type, Boolean isRead, Pageable pageable);

    // Đếm thông báo chưa đọc
    Long countByShopIdAndIsRead(UUID shopId, Boolean isRead);

    // Xóa tất cả thông báo cho một cửa hàng
    void deleteByShopId(UUID shopId);

    // Kiểm tra xem thông báo có tồn tại cho một referenceId trong khoảng thời gian không (cả đã đọc và chưa đọc)
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

    // Kiểm tra xem thông báo chưa đọc có tồn tại cho một referenceId không
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

    // Tìm thông báo theo referenceId và loại
    java.util.List<Notification> findByReferenceIdAndType(UUID referenceId, NotificationType type);

    // ============ Thông báo dựa trên tài khoản ============

    // Lấy tất cả thông báo cho một tài khoản với phân trang
    Page<Notification> findByAccountIdOrderByCreatedAtDesc(UUID accountId, Pageable pageable);

    // Lấy thông báo chưa đọc cho một tài khoản
    Page<Notification> findByAccountIdAndIsReadOrderByCreatedAtDesc(UUID accountId, Boolean isRead, Pageable pageable);

    // Lấy thông báo theo loại cho một tài khoản
    Page<Notification> findByAccountIdAndTypeOrderByCreatedAtDesc(UUID accountId, NotificationType type, Pageable pageable);

    // Lấy thông báo theo loại và trạng thái đọc cho một tài khoản
    Page<Notification> findByAccountIdAndTypeAndIsReadOrderByCreatedAtDesc(
            UUID accountId, NotificationType type, Boolean isRead, Pageable pageable);

    // Đếm thông báo chưa đọc cho một tài khoản
    Long countByAccountIdAndIsRead(UUID accountId, Boolean isRead);

    // Lấy tất cả thông báo cho cửa hàng HOẶC tài khoản (kết hợp)
    @Query("""
        select n from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
        order by n.createdAt desc
    """)
    Page<Notification> findByShopIdOrAccountIdOrderByCreatedAtDesc(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId, Pageable pageable);

    // Lấy thông báo chưa đọc cho cửa hàng HOẶC tài khoản
    @Query("""
        select n from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
          and n.isRead = :isRead
        order by n.createdAt desc
    """)
    Page<Notification> findByShopIdOrAccountIdAndIsReadOrderByCreatedAtDesc(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId,
            @Param("isRead") Boolean isRead, Pageable pageable);

    // Lấy thông báo theo loại cho cửa hàng HOẶC tài khoản
    @Query("""
        select n from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
          and n.type = :type
        order by n.createdAt desc
    """)
    Page<Notification> findByShopIdOrAccountIdAndTypeOrderByCreatedAtDesc(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId,
            @Param("type") NotificationType type, Pageable pageable);

    // Lấy thông báo theo loại và trạng thái đọc cho cửa hàng HOẶC tài khoản
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

    // Đếm thông báo chưa đọc cho cửa hàng HOẶC tài khoản
    @Query("""
        select count(n) from Notification n
        where (n.shopId = :shopId or n.accountId = :accountId)
          and n.isRead = :isRead
    """)
    Long countByShopIdOrAccountIdAndIsRead(
            @Param("shopId") UUID shopId, @Param("accountId") UUID accountId,
            @Param("isRead") Boolean isRead);
}
