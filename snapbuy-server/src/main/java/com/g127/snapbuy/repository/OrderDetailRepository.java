package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.OrderDetail;
import com.g127.snapbuy.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
