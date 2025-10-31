package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.PurchaseOrderDetail;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface PurchaseOrderDetailRepository extends JpaRepository<PurchaseOrderDetail, UUID> {

    List<PurchaseOrderDetail> findByPurchaseOrderId(UUID purchaseOrderId);

    List<PurchaseOrderDetail> findByPurchaseOrderIdIn(Collection<UUID> purchaseOrderIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from PurchaseOrderDetail d where d.purchaseOrderId = :poId")
    List<PurchaseOrderDetail> findAllForUpdateByPurchaseOrderId(@Param("poId") UUID poId);

    void deleteAllByPurchaseOrderId(UUID purchaseOrderId);
}
