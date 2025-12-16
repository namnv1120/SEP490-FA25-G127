package com.g127.snapbuy.supplier.repository;

import com.g127.snapbuy.supplier.entity.Supplier;
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
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
    Optional<Supplier> findBySupplierNameIgnoreCase(String supplierName);
    Optional<Supplier> findBySupplierCodeIgnoreCase(String supplierCode);
    boolean existsBySupplierCodeIgnoreCase(String supplierCode);

    @Query(value = """
            SELECT COUNT(DISTINCT s.supplier_id)
            FROM suppliers s
            INNER JOIN purchase_order po ON s.supplier_id = po.supplier_id
            WHERE po.status = N'Đã nhận hàng'
                AND po.received_date IS NOT NULL
                AND po.received_date >= :startDate
                AND po.received_date <= :endDate
            """, nativeQuery = true)
    Long countSuppliersByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(value = """
            SELECT 
                CAST(s.supplier_id AS VARCHAR(36)) as supplier_id,
                s.supplier_code,
                s.supplier_name,
                s.phone,
                COUNT(DISTINCT pod.product_id) as products_received_count,
                SUM(pod.received_quantity) as total_quantity_received,
                (SELECT COALESCE(SUM(po2.total_amount), 0)
                 FROM purchase_order po2
                 WHERE po2.supplier_id = s.supplier_id
                   AND po2.status = N'Đã nhận hàng'
                   AND po2.received_date IS NOT NULL
                   AND po2.received_date >= :startDate
                   AND po2.received_date <= :endDate) as total_amount
            FROM suppliers s
            INNER JOIN purchase_order po ON s.supplier_id = po.supplier_id
            INNER JOIN purchase_order_detail pod ON po.purchase_order_id = pod.purchase_order_id
            WHERE po.status = N'Đã nhận hàng'
                AND po.received_date IS NOT NULL
                AND po.received_date >= :startDate
                AND po.received_date <= :endDate
                AND pod.received_quantity > 0
            GROUP BY s.supplier_id, s.supplier_code, s.supplier_name, s.phone
            ORDER BY total_amount DESC, total_quantity_received DESC
            """, nativeQuery = true)
    List<Object[]> getSupplierProductDetails(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(value = """
            SELECT COALESCE(SUM(pod.received_quantity), 0)
            FROM purchase_order_detail pod
            INNER JOIN purchase_order po ON pod.purchase_order_id = po.purchase_order_id
            WHERE po.status = N'Đã nhận hàng'
                AND po.received_date IS NOT NULL
                AND po.received_date >= :startDate
                AND po.received_date <= :endDate
                AND pod.received_quantity > 0
            """, nativeQuery = true)
    Long sumTotalQuantityReceived(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(value = """
            SELECT COUNT(DISTINCT pod.product_id)
            FROM purchase_order_detail pod
            INNER JOIN purchase_order po ON pod.purchase_order_id = po.purchase_order_id
            WHERE po.status = N'Đã nhận hàng'
                AND po.received_date IS NOT NULL
                AND po.received_date >= :startDate
                AND po.received_date <= :endDate
                AND pod.received_quantity > 0
            """, nativeQuery = true)
    Long countUniqueProductsReceived(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query(value = """
            SELECT COALESCE(SUM(po.total_amount), 0)
            FROM purchase_order po
            WHERE po.status = N'Đã nhận hàng'
                AND po.received_date IS NOT NULL
                AND po.received_date >= :startDate
                AND po.received_date <= :endDate
            """, nativeQuery = true)
    BigDecimal sumTotalAmount(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
