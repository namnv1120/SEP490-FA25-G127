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
            "LEFT JOIN categories pc ON c.parent_category_id = pc.category_id " +
            "LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "dbo.RemoveVietnameseDiacritics(LOWER(p.product_code)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :keyword, '%'))) OR " +
            "dbo.RemoveVietnameseDiacritics(LOWER(p.product_name)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :keyword, '%')))) " +
            "AND (:active IS NULL OR p.active = :active) " +
            "AND (:categoryId IS NULL OR p.category_id = :categoryId OR " +
            "     (c.parent_category_id IS NOT NULL AND c.parent_category_id = :categoryId)) " +
            "AND (:subCategoryId IS NULL OR (c.parent_category_id IS NOT NULL AND p.category_id = :subCategoryId)) " +
            "ORDER BY p.created_date DESC",
            countQuery = "SELECT COUNT(p.product_id) FROM products p " +
            "LEFT JOIN categories c ON p.category_id = c.category_id " +
            "LEFT JOIN categories pc ON c.parent_category_id = pc.category_id " +
            "LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "dbo.RemoveVietnameseDiacritics(LOWER(p.product_code)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :keyword, '%'))) OR " +
            "dbo.RemoveVietnameseDiacritics(LOWER(p.product_name)) LIKE dbo.RemoveVietnameseDiacritics(LOWER(CONCAT('%', :keyword, '%')))) " +
            "AND (:active IS NULL OR p.active = :active) " +
            "AND (:categoryId IS NULL OR p.category_id = :categoryId OR " +
            "     (c.parent_category_id IS NOT NULL AND c.parent_category_id = :categoryId)) " +
            "AND (:subCategoryId IS NULL OR (c.parent_category_id IS NOT NULL AND p.category_id = :subCategoryId))",
            nativeQuery = true)
    Page<Product> searchByKeyword(@Param("keyword") String keyword, 
                                   @Param("active") Boolean active,
                                   @Param("categoryId") UUID categoryId,
                                   @Param("subCategoryId") UUID subCategoryId,
                                   Pageable pageable);
}
