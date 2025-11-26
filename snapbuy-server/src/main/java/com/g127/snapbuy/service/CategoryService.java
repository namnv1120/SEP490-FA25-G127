package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.CategoryCreateRequest;
import com.g127.snapbuy.dto.request.CategoryUpdateRequest;
import com.g127.snapbuy.dto.response.CategoryResponse;
import com.g127.snapbuy.dto.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    CategoryResponse createCategory(CategoryCreateRequest request);
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(UUID id);
    CategoryResponse updateCategory(UUID id, CategoryUpdateRequest request);
    void deleteCategory(UUID id);
    CategoryResponse toggleCategoryStatus(UUID id);
    PageResponse<CategoryResponse> searchParentCategoriesByKeyword(String keyword, Pageable pageable);
    PageResponse<CategoryResponse> searchSubCategoriesByKeyword(String keyword, Pageable pageable);
}
