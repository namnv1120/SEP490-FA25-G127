package com.g127.snapbuy.product.controller;

import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.product.dto.request.CategoryCreateRequest;
import com.g127.snapbuy.product.dto.request.CategoryUpdateRequest;
import com.g127.snapbuy.product.dto.response.CategoryResponse;
import com.g127.snapbuy.response.PageResponse;
import com.g127.snapbuy.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<CategoryResponse> createCategory(@RequestBody @Valid CategoryCreateRequest request) {
        ApiResponse<CategoryResponse> response = new ApiResponse<>();
        response.setResult(categoryService.createCategory(request));
        return response;
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
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
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<String> deleteCategoryById(@PathVariable("id") UUID id) {
        categoryService.deleteCategory(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Danh mục đã được xoá");
        return response;
    }

    @PatchMapping("{id}/toggle-status")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<CategoryResponse> toggleCategoryStatus(@PathVariable("id") UUID id) {
        ApiResponse<CategoryResponse> response = new ApiResponse<>();
        response.setResult(categoryService.toggleCategoryStatus(id));
        return response;
    }

    @GetMapping("/search-parent-categories")
    public ApiResponse<PageResponse<CategoryResponse>> searchParentCategories(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        // For native query, we don't use Sort in Pageable as the query already has ORDER BY
        var pageable = PageRequest.of(
            Math.max(page, 0), 
            Math.min(Math.max(size, 1), 200)
        );
        ApiResponse<PageResponse<CategoryResponse>> response = new ApiResponse<>();
        response.setResult(categoryService.searchParentCategoriesByKeyword(keyword, pageable));
        return response;
    }

    @GetMapping("/search-sub-categories")
    public ApiResponse<PageResponse<CategoryResponse>> searchSubCategories(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        // For native query, we don't use Sort in Pageable as the query already has ORDER BY
        var pageable = PageRequest.of(
            Math.max(page, 0), 
            Math.min(Math.max(size, 1), 200)
        );
        ApiResponse<PageResponse<CategoryResponse>> response = new ApiResponse<>();
        response.setResult(categoryService.searchSubCategoriesByKeyword(keyword, pageable));
        return response;
    }
}
