package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
}
