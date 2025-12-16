package com.g127.snapbuy.payment.repository;

import com.g127.snapbuy.payment.entity.Payment;
import com.g127.snapbuy.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByOrder_OrderId(UUID orderId);
    Optional<Payment> findByTransactionReference(String transactionReference);
    Payment findByOrder(Order order);
    
    // Batch fetch payments for multiple orders
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Payment p WHERE p.order.orderId IN :orderIds")
    List<Payment> findByOrderIdIn(@org.springframework.data.repository.query.Param("orderIds") List<UUID> orderIds);
}

