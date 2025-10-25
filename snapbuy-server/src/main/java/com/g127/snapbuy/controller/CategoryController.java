package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.CategoryCreateRequest;
import com.g127.snapbuy.dto.request.CategoryUpdateRequest;
import com.g127.snapbuy.dto.response.CategoryResponse;
import com.g127.snapbuy.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(@RequestBody @Valid CategoryCreateRequest request) {
        ApiResponse<CategoryResponse> response = new ApiResponse<>();
        response.setResult(categoryService.createCategory(request));
        return response;
    }

    @PutMapping("{id}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable("id") UUID id,
            @RequestBody @Valid CategoryUpdateRequest request) {
        ApiResponse<CategoryResponse> response = new ApiResponse<>();
        response.setResult(categoryService.updateCategory(id, request));
        return response;
    }

    @GetMapping("{id}")
    public ApiResponse<CategoryResponse> getCategoryById(@PathVariable("id") UUID id) {
        ApiResponse<CategoryResponse> response = new ApiResponse<>();
        response.setResult(categoryService.getCategoryById(id));
        return response;
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        ApiResponse<List<CategoryResponse>> response = new ApiResponse<>();
        response.setResult(categoryService.getAllCategories());
        return response;
    }

    @DeleteMapping("{id}")
    public ApiResponse<String> deleteCategoryById(@PathVariable("id") UUID id) {
        categoryService.deleteCategory(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Danh mục đã được xoá");
        return response;
    }
}
