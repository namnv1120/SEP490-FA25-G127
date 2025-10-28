package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;
import java.time.LocalDateTime;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID> {

    boolean existsByNumber(String number);

    Page<PurchaseOrder> findByStatusContainingIgnoreCase(String status, Pageable pageable);
    Page<PurchaseOrder> findBySupplierId(UUID supplierId, Pageable pageable);
    Page<PurchaseOrder> findByOrderDateBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
}
