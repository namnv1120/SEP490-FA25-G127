package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Category;
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

    // Search parent categories by name
    @Query(value = "SELECT c.* FROM categories c " +
            "WHERE (c.parent_category_id IS NULL) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(c.category_name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY c.created_date DESC",
            countQuery = "SELECT COUNT(c.category_id) FROM categories c " +
            "WHERE (c.parent_category_id IS NULL) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(c.category_name) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            nativeQuery = true)
    Page<Category> searchParentCategoriesByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Search sub categories by name (both sub category name and parent category name)
    @Query(value = "SELECT c.* FROM categories c " +
            "LEFT JOIN categories p ON c.parent_category_id = p.category_id " +
            "WHERE (c.parent_category_id IS NOT NULL) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(c.category_name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.category_name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY c.created_date DESC",
            countQuery = "SELECT COUNT(c.category_id) FROM categories c " +
            "LEFT JOIN categories p ON c.parent_category_id = p.category_id " +
            "WHERE (c.parent_category_id IS NOT NULL) " +
            "AND (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(c.category_name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.category_name) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            nativeQuery = true)
    Page<Category> searchSubCategoriesByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
