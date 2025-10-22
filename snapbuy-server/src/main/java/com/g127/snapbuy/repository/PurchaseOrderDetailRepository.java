package com.g127.snapbuy.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface PurchaseOrderDetailRepository extends JpaRepository<com.g127.snapbuy.entity.PurchaseOrderDetail, UUID> {

    @Query(value = """
        SELECT *
        FROM purchase_order_detail WITH (NOLOCK)
        WHERE purchase_order_id = :poId
    """, nativeQuery = true)
    List<com.g127.snapbuy.entity.PurchaseOrderDetail> findByPurchaseOrderId(@Param("poId") UUID poId);
}
