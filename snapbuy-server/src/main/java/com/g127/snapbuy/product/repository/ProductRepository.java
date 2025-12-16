package com.g127.snapbuy.product.repository;

import com.g127.snapbuy.product.entity.Product;
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

    // Simple JPQL query - keyword filtering is done in Java layer using VietnameseUtils
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN FETCH p.category c " +
           "LEFT JOIN FETCH p.supplier s " +
           "WHERE (:active IS NULL OR p.active = :active) " +
           "AND (:categoryId IS NULL OR p.category.categoryId = :categoryId OR c.parentCategoryId = :categoryId) " +
           "AND (:subCategoryId IS NULL OR (c.parentCategoryId IS NOT NULL AND p.category.categoryId = :subCategoryId)) " +
           "ORDER BY p.createdDate DESC")
    List<Product> findProductsForSearch(@Param("active") Boolean active,
                                        @Param("categoryId") UUID categoryId,
                                        @Param("subCategoryId") UUID subCategoryId);
}
