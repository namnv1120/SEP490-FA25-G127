package com.g127.snapbuy.product.repository;

import com.g127.snapbuy.product.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    boolean existsByCategoryName(String categoryName);

    boolean existsByParentCategoryId(UUID parentCategoryId);

    Optional<Category> findByCategoryNameIgnoreCase(String categoryName);

    List<Category> findByParentCategoryId(UUID parentCategoryId);

    // Simple JPQL query - keyword filtering is done in Java layer using VietnameseUtils
    @Query("SELECT c FROM Category c WHERE c.parentCategoryId IS NULL ORDER BY c.createdDate DESC")
    List<Category> findAllParentCategories();

    // Simple JPQL query - keyword filtering is done in Java layer using VietnameseUtils
    @Query("SELECT c FROM Category c WHERE c.parentCategoryId IS NOT NULL ORDER BY c.createdDate DESC")
    List<Category> findAllSubCategories();
}
