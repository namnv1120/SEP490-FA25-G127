package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.CategoryCreateRequest;
import com.g127.snapbuy.dto.request.CategoryUpdateRequest;
import com.g127.snapbuy.dto.response.CategoryResponse;
import com.g127.snapbuy.entity.Category;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.CategoryMapper;
import com.g127.snapbuy.repository.CategoryRepository;
import com.g127.snapbuy.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new AppException(ErrorCode.NAME_EXISTED);
        }

        if (request.getParentCategoryId() != null) {
            if (!categoryRepository.existsById(request.getParentCategoryId())) {
                throw new AppException(ErrorCode.PARENT_NOT_FOUND);
            }
        }

        Category category = categoryMapper.toEntity(request);
        category.setCreatedDate(LocalDateTime.now());
        category.setUpdatedDate(LocalDateTime.now());
        categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse updateCategory(UUID id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (categoryRepository.existsByCategoryName(request.getCategoryName())
                && !category.getCategoryName().equals(request.getCategoryName())) {
            throw new AppException(ErrorCode.NAME_EXISTED);
        }

        if (request.getParentCategoryId() != null) {
            if (!categoryRepository.existsById(request.getParentCategoryId())) {
                throw new AppException(ErrorCode.PARENT_NOT_FOUND);
            }
        }

        categoryMapper.updateEntity(category, request);
        category.setUpdatedDate(LocalDateTime.now());
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        categoryRepository.delete(category);
    }
}