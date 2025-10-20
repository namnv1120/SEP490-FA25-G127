package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.OrderDetail;
import com.g127.snapbuy.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, UUID> {

    List<OrderDetail> findByOrder(Order order);

    @Query(value = """
            SELECT 
                p.product_id,
                p.product_name,
                SUM(od.quantity) as total_sold,
                SUM(od.total_price) as total_revenue,
                c.category_id,
                c.category_name,
                s.supplier_id,
                s.supplier_name
            FROM orders o
            JOIN order_detail od ON o.order_id = od.order_id
            JOIN products p ON od.product_id = p.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
            WHERE o.payment_status = 'PAID'
              AND o.order_date BETWEEN :fromDate AND :toDate
            GROUP BY p.product_id, p.product_name, c.category_id, c.category_name, s.supplier_id, s.supplier_name
            ORDER BY total_revenue DESC
            """, nativeQuery = true)
    List<Object[]> getProductRevenueReport(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query(value = """
        WITH base AS (
            SELECT 
                p.product_id,
                p.product_name,
                c.category_id,
                c.category_name,
                s.supplier_id,
                s.supplier_name,
                SUM(od.quantity) AS total_sold,
                SUM(od.total_price) AS total_revenue
            FROM orders o
            JOIN order_detail od ON o.order_id = od.order_id
            JOIN products p      ON od.product_id = p.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN suppliers s  ON p.supplier_id = s.supplier_id
            WHERE o.payment_status = 'PAID'
              AND o.order_date BETWEEN :fromDate AND :toDate
              AND (:productId IS NULL OR p.product_id = :productId)
              AND (:categoryId IS NULL OR c.category_id = :categoryId)
              AND (:supplierId IS NULL OR s.supplier_id = :supplierId)
            GROUP BY p.product_id, p.product_name, c.category_id, c.category_name, s.supplier_id, s.supplier_name
        )
        SELECT
            product_id, product_name, total_sold, total_revenue,
            category_id, category_name, supplier_id, supplier_name
        FROM base
        WHERE (:minRevenue IS NULL OR total_revenue >= :minRevenue)
        ORDER BY 
            CASE WHEN :sortBy = 'sold'    AND :sortDir = 'asc'  THEN total_sold    END ASC,
            CASE WHEN :sortBy = 'sold'    AND :sortDir = 'desc' THEN total_sold    END DESC,
            CASE WHEN :sortBy = 'revenue' AND :sortDir = 'asc'  THEN total_revenue END ASC,
            CASE WHEN :sortBy = 'revenue' AND :sortDir = 'desc' THEN total_revenue END DESC,
            total_revenue DESC
        OFFSET 0 ROWS
        FETCH NEXT :limitRows ROWS ONLY
        """, nativeQuery = true)
    List<Object[]> reportProductRevenueFlexible(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("productId") UUID productId,
            @Param("categoryId") UUID categoryId,
            @Param("supplierId") UUID supplierId,
            @Param("minRevenue") BigDecimal minRevenue,
            @Param("limitRows") int limitRows,
            @Param("sortBy") String sortBy,
            @Param("sortDir") String sortDir
    );
}
