package com.g127.snapbuy.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<com.g127.snapbuy.entity.PurchaseOrder, UUID> {

    @Query(value = """
        SELECT *
        FROM purchase_order WITH (NOLOCK)
        WHERE purchase_order_id = :id
    """, nativeQuery = true)
    Optional<com.g127.snapbuy.entity.PurchaseOrder> findNativeById(@Param("id") UUID id);

    boolean existsByNumber(String number);
}
