package com.g127.snapbuy.product.service.impl;

import com.g127.snapbuy.product.dto.request.CategoryCreateRequest;
import com.g127.snapbuy.product.dto.request.CategoryUpdateRequest;
import com.g127.snapbuy.product.dto.response.CategoryResponse;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.common.utils.VietnameseUtils;
import com.g127.snapbuy.product.entity.Category;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.product.mapper.CategoryMapper;
import com.g127.snapbuy.product.repository.CategoryRepository;
import com.g127.snapbuy.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
        
        deleteChildCategories(id);
        
        categoryRepository.delete(category);
    }
    
    private void deleteChildCategories(UUID parentId) {
        List<Category> childCategories = categoryRepository.findByParentCategoryId(parentId);
        
        for (Category child : childCategories) {
            deleteChildCategories(child.getCategoryId());
            
            categoryRepository.delete(child);
        }
    }

    @Override
    public CategoryResponse toggleCategoryStatus(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        Boolean currentActive = category.getActive();
        Boolean newActive = currentActive == null || !currentActive;

        category.setActive(newActive);
        category.setUpdatedDate(LocalDateTime.now());
        Category savedCategory = categoryRepository.save(category);
        
        if (newActive) {
            if (category.getParentCategoryId() != null) {
                enableParentCategories(category.getParentCategoryId());
            }
            
            enableChildCategories(id);
        } else {
            disableChildCategories(id);
        }
        
        return categoryMapper.toResponse(savedCategory);
    }

    private void disableChildCategories(UUID parentId) {
        List<Category> childCategories = categoryRepository.findByParentCategoryId(parentId);
        
        for (Category child : childCategories) {
            if (child.getActive() != null && child.getActive()) {
                child.setActive(false);
                child.setUpdatedDate(LocalDateTime.now());
                categoryRepository.save(child);

                disableChildCategories(child.getCategoryId());
            }
        }
    }
    
    private void enableChildCategories(UUID parentId) {
        List<Category> childCategories = categoryRepository.findByParentCategoryId(parentId);
        
        for (Category child : childCategories) {
            if (child.getActive() == null || !child.getActive()) {
                child.setActive(true);
                child.setUpdatedDate(LocalDateTime.now());
                categoryRepository.save(child);

                enableChildCategories(child.getCategoryId());
            }
        }
    }
    
    private void enableParentCategories(UUID parentId) {
        Category parentCategory = categoryRepository.findById(parentId).orElse(null);
        
        if (parentCategory != null) {
            if (parentCategory.getActive() == null || !parentCategory.getActive()) {
                parentCategory.setActive(true);
                parentCategory.setUpdatedDate(LocalDateTime.now());
                categoryRepository.save(parentCategory);

                if (parentCategory.getParentCategoryId() != null) {
                    enableParentCategories(parentCategory.getParentCategoryId());
                }
            }
        }
    }

    @Override
    public PageResponse<CategoryResponse> searchParentCategoriesByKeyword(String keyword, Pageable pageable) {
        // Fetch all parent categories from DB
        List<Category> allCategories = categoryRepository.findAllParentCategories();
        
        // Filter by keyword in Java using VietnameseUtils
        String trimmedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        List<Category> filteredCategories = allCategories;
        
        if (trimmedKeyword != null) {
            filteredCategories = allCategories.stream()
                .filter(c -> VietnameseUtils.containsIgnoreDiacritics(c.getCategoryName(), trimmedKeyword))
                .toList();
        }
        
        // Manual pagination
        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int totalElements = filteredCategories.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        int fromIndex = pageNumber * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        
        List<Category> pagedCategories = (fromIndex < totalElements) 
            ? filteredCategories.subList(fromIndex, toIndex) 
            : List.of();
        
        List<CategoryResponse> responseList = pagedCategories.stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<CategoryResponse>builder()
                .content(responseList)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .size(pageSize)
                .number(pageNumber)
                .first(pageNumber == 0)
                .last(pageNumber >= totalPages - 1)
                .empty(responseList.isEmpty())
                .build();
    }

    @Override
    public PageResponse<CategoryResponse> searchSubCategoriesByKeyword(String keyword, Pageable pageable) {
        // Fetch all sub categories from DB
        List<Category> allCategories = categoryRepository.findAllSubCategories();
        
        // Filter by keyword in Java using VietnameseUtils (search in both category name and parent name)
        String trimmedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        List<Category> filteredCategories = allCategories;
        
        if (trimmedKeyword != null) {
            filteredCategories = allCategories.stream()
                .filter(c -> {
                    // Search in category name
                    if (VietnameseUtils.containsIgnoreDiacritics(c.getCategoryName(), trimmedKeyword)) {
                        return true;
                    }
                    // Also search in parent category name
                    if (c.getParentCategoryId() != null) {
                        Category parent = categoryRepository.findById(c.getParentCategoryId()).orElse(null);
                        if (parent != null && VietnameseUtils.containsIgnoreDiacritics(parent.getCategoryName(), trimmedKeyword)) {
                            return true;
                        }
                    }
                    return false;
                })
                .toList();
        }
        
        // Manual pagination
        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int totalElements = filteredCategories.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        int fromIndex = pageNumber * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        
        List<Category> pagedCategories = (fromIndex < totalElements) 
            ? filteredCategories.subList(fromIndex, toIndex) 
            : List.of();
        
        List<CategoryResponse> responseList = pagedCategories.stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<CategoryResponse>builder()
                .content(responseList)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .size(pageSize)
                .number(pageNumber)
                .first(pageNumber == 0)
                .last(pageNumber >= totalPages - 1)
                .empty(responseList.isEmpty())
                .build();
    }
    
}