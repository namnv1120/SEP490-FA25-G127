package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Customer;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    @Query("""
        SELECT c FROM Customer c
        WHERE (LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))
           AND c.active = true
    """)
    List<Customer> searchByKeyword(@Param("keyword") String keyword);

    Customer getCustomerByPhone(String phone);
    
    List<Customer> findByPointsBetween(Integer min, Integer max, Sort sort);

    @Query("SELECT COUNT(DISTINCT c.customerId) FROM Customer c " +
            "JOIN Order o ON c.customerId = o.customer.customerId " +
            "WHERE o.createdDate BETWEEN :startDate AND :endDate " +
            "AND o.paymentStatus = :paymentStatus")
    Long countCustomersByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("paymentStatus") String paymentStatus);

    @Query(value = """
            SELECT 
                CAST(c.customer_id AS VARCHAR(36)) as customer_id,
                c.customer_code,
                c.full_name as customer_name,
                c.phone,
                COUNT(DISTINCT od.product_id) as products_purchased_count,
                SUM(od.quantity) as total_quantity_purchased
            FROM customers c
            INNER JOIN orders o ON c.customer_id = o.customer_id 
                AND o.payment_status = :paymentStatus
                AND o.created_date BETWEEN :startDate AND :endDate
            INNER JOIN order_detail od ON o.order_id = od.order_id
            GROUP BY c.customer_id, c.customer_code, c.full_name, c.phone
            ORDER BY products_purchased_count DESC, total_quantity_purchased DESC
            """, nativeQuery = true)
    List<Object[]> getCustomerPurchaseDetails(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("paymentStatus") String paymentStatus);

    @Query("SELECT COUNT(DISTINCT od.product.productId) FROM OrderDetail od " +
            "JOIN od.order o " +
            "JOIN o.customer c " +
            "WHERE o.createdDate BETWEEN :startDate AND :endDate " +
            "AND o.paymentStatus = :paymentStatus")
    Long countTotalProductsPurchasedByNewCustomers(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("paymentStatus") String paymentStatus);

    long countByCreatedDateBetween(LocalDateTime start, LocalDateTime end);
}

