package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Payment;
import com.g127.snapbuy.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Payment findByOrder(Order order);
    Optional<Payment> findByTransactionReference(String transactionReference);
}

