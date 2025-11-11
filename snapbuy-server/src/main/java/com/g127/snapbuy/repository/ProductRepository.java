package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findByProductCode(String productCode);
    boolean existsByProductCode(String productCode);
    List<Product> findBySupplier_SupplierId(UUID supplierId);
    Optional<Product> findByBarcode(String barcode);
    boolean existsByBarcode(String barcode);

    @Query("SELECT p FROM Product p JOIN FETCH p.category c WHERE p.active = true AND c.active = true")
    List<Product> findAllActiveWithActiveCategory();

    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.barcode = :barcode")
    Optional<Product> findByBarcodeWithCategory(@Param("barcode") String barcode);

    @Query(value = "SELECT p.* FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.category_id " +
            "LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(p.product_code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.product_name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY p.created_date DESC",
            countQuery = "SELECT COUNT(p.product_id) FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.category_id " +
            "LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(p.product_code) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.product_name) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            nativeQuery = true)
    Page<Product> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
