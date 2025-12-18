package com.g127.snapbuy.product.service.impl;

import com.g127.snapbuy.product.dto.request.CategoryCreateRequest;
import com.g127.snapbuy.product.dto.request.CategoryUpdateRequest;
import com.g127.snapbuy.product.dto.response.CategoryResponse;
import com.g127.snapbuy.product.entity.Category;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.product.mapper.CategoryMapper;
import com.g127.snapbuy.product.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category testCategory;
    private CategoryCreateRequest createRequest;
    private CategoryUpdateRequest updateRequest;
    private CategoryResponse categoryResponse;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setCategoryId(UUID.randomUUID());
        testCategory.setCategoryName("Test Category");
        testCategory.setActive(true);
        testCategory.setParentCategoryId(null);

        createRequest = new CategoryCreateRequest();
        createRequest.setCategoryName("New Category");
        createRequest.setActive(true);

        updateRequest = new CategoryUpdateRequest();
        updateRequest.setCategoryName("Updated Category");
        updateRequest.setActive(true);

        categoryResponse = new CategoryResponse();
        categoryResponse.setCategoryId(testCategory.getCategoryId());
        categoryResponse.setCategoryName(testCategory.getCategoryName());
        categoryResponse.setActive(testCategory.getActive());
    }

    @Test
    void createCategory_Success() {
        // Given
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(false);
        when(categoryMapper.toEntity(any(CategoryCreateRequest.class))).thenReturn(testCategory);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);

        // When
        CategoryResponse result = categoryService.createCategory(createRequest);

        // Then
        assertNotNull(result);
        assertEquals(categoryResponse.getCategoryName(), result.getCategoryName());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategory_WithParentCategory_Success() {
        // Given
        UUID parentId = UUID.randomUUID();
        createRequest.setParentCategoryId(parentId);
        
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(false);
        when(categoryRepository.existsById(parentId)).thenReturn(true);
        when(categoryMapper.toEntity(any(CategoryCreateRequest.class))).thenReturn(testCategory);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);

        // When
        CategoryResponse result = categoryService.createCategory(createRequest);

        // Then
        assertNotNull(result);
        verify(categoryRepository).existsById(parentId);
    }

    @Test
    void createCategory_NameExists_ThrowsException() {
        // Given
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> categoryService.createCategory(createRequest));
        assertEquals(ErrorCode.NAME_EXISTED, exception.getErrorCode());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void createCategory_ParentNotFound_ThrowsException() {
        // Given
        UUID parentId = UUID.randomUUID();
        createRequest.setParentCategoryId(parentId);
        
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(false);
        when(categoryRepository.existsById(parentId)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> categoryService.createCategory(createRequest));
        assertEquals(ErrorCode.PARENT_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getAllCategories_Success() {
        // Given
        List<Category> categories = Arrays.asList(testCategory);
        when(categoryRepository.findAll()).thenReturn(categories);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);

        // When
        List<CategoryResponse> result = categoryService.getAllCategories();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(categoryRepository).findAll();
    }

    @Test
    void getAllCategories_EmptyList_ReturnsEmptyList() {
        // Given
        when(categoryRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<CategoryResponse> result = categoryService.getAllCategories();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getCategoryById_Success() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);

        // When
        CategoryResponse result = categoryService.getCategoryById(categoryId);

        // Then
        assertNotNull(result);
        assertEquals(categoryResponse.getCategoryName(), result.getCategoryName());
    }

    @Test
    void getCategoryById_NotFound_ThrowsException() {
        // Given
        UUID categoryId = UUID.randomUUID();
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> categoryService.getCategoryById(categoryId));
        assertEquals(ErrorCode.CATEGORY_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void updateCategory_Success() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);

        // When
        CategoryResponse result = categoryService.updateCategory(categoryId, updateRequest);

        // Then
        assertNotNull(result);
        verify(categoryMapper).updateEntity(any(Category.class), any(CategoryUpdateRequest.class));
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void updateCategory_SameName_Success() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        updateRequest.setCategoryName("Test Category"); // Same as current name
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(true);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);

        // When
        CategoryResponse result = categoryService.updateCategory(categoryId, updateRequest);

        // Then
        assertNotNull(result);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void updateCategory_NameExistsForOtherCategory_ThrowsException() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        updateRequest.setCategoryName("Different Name");
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> categoryService.updateCategory(categoryId, updateRequest));
        assertEquals(ErrorCode.NAME_EXISTED, exception.getErrorCode());
    }

    @Test
    void updateCategory_WithParentCategory_Success() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        UUID parentId = UUID.randomUUID();
        updateRequest.setParentCategoryId(parentId);
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(false);
        when(categoryRepository.existsById(parentId)).thenReturn(true);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);

        // When
        CategoryResponse result = categoryService.updateCategory(categoryId, updateRequest);

        // Then
        assertNotNull(result);
        verify(categoryRepository).existsById(parentId);
    }

    @Test
    void updateCategory_ParentNotFound_ThrowsException() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        UUID parentId = UUID.randomUUID();
        updateRequest.setParentCategoryId(parentId);
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.existsByCategoryName(anyString())).thenReturn(false);
        when(categoryRepository.existsById(parentId)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> categoryService.updateCategory(categoryId, updateRequest));
        assertEquals(ErrorCode.PARENT_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void deleteCategory_Success() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.findByParentCategoryId(categoryId)).thenReturn(Collections.emptyList());

        // When
        categoryService.deleteCategory(categoryId);

        // Then
        verify(categoryRepository).delete(testCategory);
    }

    @Test
    void deleteCategory_WithChildren_DeletesAllChildren() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        
        Category childCategory = new Category();
        childCategory.setCategoryId(UUID.randomUUID());
        childCategory.setParentCategoryId(categoryId);
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.findByParentCategoryId(categoryId))
            .thenReturn(Arrays.asList(childCategory))
            .thenReturn(Collections.emptyList());
        when(categoryRepository.findByParentCategoryId(childCategory.getCategoryId()))
            .thenReturn(Collections.emptyList());

        // When
        categoryService.deleteCategory(categoryId);

        // Then
        verify(categoryRepository).delete(childCategory);
        verify(categoryRepository).delete(testCategory);
    }

    @Test
    void deleteCategory_NotFound_ThrowsException() {
        // Given
        UUID categoryId = UUID.randomUUID();
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> categoryService.deleteCategory(categoryId));
        assertEquals(ErrorCode.CATEGORY_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void toggleCategoryStatus_ActivateCategory_Success() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        testCategory.setActive(false);
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);
        when(categoryRepository.findByParentCategoryId(categoryId)).thenReturn(Collections.emptyList());

        // When
        CategoryResponse result = categoryService.toggleCategoryStatus(categoryId);

        // Then
        assertNotNull(result);
        verify(categoryRepository).save(argThat(cat -> cat.getActive()));
    }

    @Test
    void toggleCategoryStatus_DeactivateCategory_Success() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        testCategory.setActive(true);
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);
        when(categoryRepository.findByParentCategoryId(categoryId)).thenReturn(Collections.emptyList());

        // When
        CategoryResponse result = categoryService.toggleCategoryStatus(categoryId);

        // Then
        assertNotNull(result);
        verify(categoryRepository).save(argThat(cat -> !cat.getActive()));
    }

    @Test
    void toggleCategoryStatus_NullActive_ActivatesCategory() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        testCategory.setActive(null);
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);
        when(categoryRepository.findByParentCategoryId(categoryId)).thenReturn(Collections.emptyList());

        // When
        CategoryResponse result = categoryService.toggleCategoryStatus(categoryId);

        // Then
        assertNotNull(result);
        verify(categoryRepository).save(argThat(cat -> cat.getActive()));
    }

    @Test
    void toggleCategoryStatus_ActivateWithParent_EnablesParent() {
        // Given
        UUID categoryId = testCategory.getCategoryId();
        UUID parentId = UUID.randomUUID();
        testCategory.setActive(false);
        testCategory.setParentCategoryId(parentId);
        
        Category parentCategory = new Category();
        parentCategory.setCategoryId(parentId);
        parentCategory.setActive(false);
        
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryRepository.findById(parentId)).thenReturn(Optional.of(parentCategory));
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(categoryResponse);
        when(categoryRepository.findByParentCategoryId(any())).thenReturn(Collections.emptyList());

        // When
        CategoryResponse result = categoryService.toggleCategoryStatus(categoryId);

        // Then
        assertNotNull(result);
        verify(categoryRepository, atLeastOnce()).save(any(Category.class));
    }

}
