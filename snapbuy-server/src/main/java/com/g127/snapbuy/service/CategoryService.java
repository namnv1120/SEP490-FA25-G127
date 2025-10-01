package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.CategoryCreateRequest;
import com.g127.snapbuy.dto.request.CategoryUpdateRequest;
import com.g127.snapbuy.dto.response.CategoryResponse;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    CategoryResponse createCategory(CategoryCreateRequest request);
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(UUID id);
    CategoryResponse updateCategory(UUID id, CategoryUpdateRequest request);
    void deleteCategory(UUID id);
}
