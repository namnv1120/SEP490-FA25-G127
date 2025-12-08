package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT SUM(o.totalAmount) FROM Order o " +
            "WHERE o.createdDate BETWEEN :startDate AND :endDate " +
            "AND o.paymentStatus = :paymentStatus")
    BigDecimal sumRevenueByDateRangeAndPaymentStatus(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("paymentStatus") String paymentStatus);


    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.createdDate BETWEEN :startDate AND :endDate " +
            "AND o.paymentStatus = :paymentStatus")
    Long countOrdersByDateRangeAndPaymentStatus(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("paymentStatus") String paymentStatus);

    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.account.accountId = :accountId " +
            "AND o.createdDate BETWEEN :startDate AND :endDate " +
            "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)")
    Long countOrdersByAccountAndDateRange(
            @Param("accountId") UUID accountId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("paymentStatus") String paymentStatus);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
            "WHERE o.account.accountId = :accountId " +
            "AND o.createdDate BETWEEN :startDate AND :endDate " +
            "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)")
    BigDecimal sumRevenueByAccountAndDateRange(
            @Param("accountId") UUID accountId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("paymentStatus") String paymentStatus);

    @Query(value = """
        SELECT DISTINCT o.*
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.customer_id
        LEFT JOIN accounts a ON o.account_id = a.account_id
        WHERE (:searchTerm IS NULL OR :searchTerm = '' OR
               dbo.RemoveVietnameseDiacritics(LOWER(o.order_number)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :searchTerm, '%'))) OR
               dbo.RemoveVietnameseDiacritics(LOWER(c.full_name)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :searchTerm, '%'))) OR
               dbo.RemoveVietnameseDiacritics(LOWER(a.full_name)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :searchTerm, '%'))) OR
               dbo.RemoveVietnameseDiacritics(LOWER(a.username)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :searchTerm, '%'))))
        AND (:orderStatus IS NULL OR :orderStatus = '' OR o.order_status = :orderStatus)
        AND (:fromDate IS NULL OR o.order_date >= :fromDate)
        AND (:toDate IS NULL OR o.order_date <= :toDate)
        ORDER BY o.order_date DESC
        """, nativeQuery = true)
    List<Order> searchOrders(
            @Param("searchTerm") String searchTerm,
            @Param("orderStatus") String orderStatus,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = """
        SELECT DISTINCT o.*
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.customer_id
        LEFT JOIN accounts a ON o.account_id = a.account_id
        WHERE (:searchTerm IS NULL OR :searchTerm = '' OR
               dbo.RemoveVietnameseDiacritics(LOWER(o.order_number)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :searchTerm, '%'))) OR
               dbo.RemoveVietnameseDiacritics(LOWER(c.full_name)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :searchTerm, '%'))) OR
               dbo.RemoveVietnameseDiacritics(LOWER(a.full_name)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :searchTerm, '%'))) OR
               dbo.RemoveVietnameseDiacritics(LOWER(a.username)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :searchTerm, '%'))))
        AND (:orderStatus IS NULL OR :orderStatus = '' OR o.order_status = :orderStatus)
        AND (:fromDate IS NULL OR o.updated_date >= :fromDate)
        AND (:toDate IS NULL OR o.updated_date <= :toDate)
        ORDER BY o.updated_date DESC
        """, nativeQuery = true)
    List<Order> searchReturnOrders(
            @Param("searchTerm") String searchTerm,
            @Param("orderStatus") String orderStatus,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query("SELECT o FROM Order o WHERE o.account.accountId = :accountId AND o.createdDate BETWEEN :start AND :end ORDER BY o.createdDate DESC")
    List<Order> findByAccountAndCreatedDateBetween(@Param("accountId") UUID accountId,
                                                   @Param("start") LocalDateTime start,
                                                   @Param("end") LocalDateTime end);

    @Query("SELECT o FROM Order o WHERE o.account.accountId = :accountId AND o.orderDate BETWEEN :start AND :end ORDER BY o.orderDate DESC")
    List<Order> findByAccountAndOrderDateBetween(@Param("accountId") UUID accountId,
                                                 @Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end);
}
