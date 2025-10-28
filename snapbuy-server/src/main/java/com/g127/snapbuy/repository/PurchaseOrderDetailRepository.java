package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.PurchaseOrderDetail;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface PurchaseOrderDetailRepository extends JpaRepository<com.g127.snapbuy.entity.PurchaseOrderDetail, UUID> {

    List<PurchaseOrderDetail> findByPurchaseOrderId(UUID purchaseOrderId);
}
