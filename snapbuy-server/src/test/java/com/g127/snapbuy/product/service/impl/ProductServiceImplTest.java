package com.g127.snapbuy.product.service.impl;

import com.g127.snapbuy.product.dto.response.ProductResponse;
import com.g127.snapbuy.product.entity.Category;
import com.g127.snapbuy.product.entity.Product;
import com.g127.snapbuy.product.entity.ProductPrice;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.product.mapper.ProductMapper;
import com.g127.snapbuy.product.repository.*;
import com.g127.snapbuy.inventory.repository.InventoryRepository;
import com.g127.snapbuy.supplier.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ProductPriceRepository productPriceRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product testProduct;
    private ProductResponse productResponse;
    private Category testCategory;
    private Category parentCategory;
    private ProductPrice testPrice;
    private UUID productId;
    private UUID categoryId;
    private UUID parentCategoryId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
        parentCategoryId = UUID.randomUUID();

        parentCategory = new Category();
        parentCategory.setCategoryId(parentCategoryId);
        parentCategory.setCategoryName("Parent Category");
        parentCategory.setParentCategoryId(null);

        testCategory = new Category();
        testCategory.setCategoryId(categoryId);
        testCategory.setCategoryName("Test Category");
        testCategory.setParentCategoryId(parentCategoryId);

        testProduct = new Product();
        testProduct.setProductId(productId);
        testProduct.setProductCode("PROD001");
        testProduct.setProductName("Test Product");
        testProduct.setCategory(testCategory);
        testProduct.setActive(true);

        testPrice = new ProductPrice();
        testPrice.setPriceId(UUID.randomUUID());
        testPrice.setProduct(testProduct);
        testPrice.setUnitPrice(BigDecimal.valueOf(100000));
        testPrice.setCostPrice(BigDecimal.valueOf(80000));

        productResponse = new ProductResponse();
        productResponse.setProductId(productId);
        productResponse.setProductCode("PROD001");
        productResponse.setProductName("Test Product");
    }

    @Test
    void getProductById_Success() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productMapper.toResponse(testProduct)).thenReturn(productResponse);
        when(categoryRepository.findById(parentCategoryId)).thenReturn(Optional.of(parentCategory));
        when(productPriceRepository.findTopByProduct_ProductIdOrderByValidFromDesc(productId))
            .thenReturn(Optional.of(testPrice));

        // When
        ProductResponse result = productService.getProductById(productId);

        // Then
        assertNotNull(result);
        assertEquals(productId, result.getProductId());
        verify(productRepository).findById(productId);
    }

    @Test
    void getProductById_NotFound_ThrowsException() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> productService.getProductById(productId));
        assertEquals(ErrorCode.PRODUCT_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getProductById_WithParentCategory_Success() {
        // Given
        testProduct.setCategory(parentCategory);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productMapper.toResponse(testProduct)).thenReturn(productResponse);
        when(productPriceRepository.findTopByProduct_ProductIdOrderByValidFromDesc(productId))
            .thenReturn(Optional.empty());

        // When
        ProductResponse result = productService.getProductById(productId);

        // Then
        assertNotNull(result);
        verify(categoryRepository, never()).findById(any());
    }

    @Test
    void getProductById_NoPrice_Success() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productMapper.toResponse(testProduct)).thenReturn(productResponse);
        when(categoryRepository.findById(parentCategoryId)).thenReturn(Optional.of(parentCategory));
        when(productPriceRepository.findTopByProduct_ProductIdOrderByValidFromDesc(productId))
            .thenReturn(Optional.empty());

        // When
        ProductResponse result = productService.getProductById(productId);

        // Then
        assertNotNull(result);
        assertNull(result.getUnitPrice());
        assertNull(result.getCostPrice());
    }

    @Test
    void deleteProduct_Success() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        doNothing().when(productPriceRepository).deleteAllByProduct_ProductId(productId);
        doNothing().when(inventoryRepository).deleteAllByProduct_ProductId(productId);
        doNothing().when(productRepository).delete(testProduct);

        // When
        productService.deleteProduct(productId);

        // Then
        verify(productPriceRepository).deleteAllByProduct_ProductId(productId);
        verify(inventoryRepository).deleteAllByProduct_ProductId(productId);
        verify(productRepository).delete(testProduct);
    }

    @Test
    void deleteProduct_NotFound_ThrowsException() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> productService.deleteProduct(productId));
        assertEquals(ErrorCode.PRODUCT_NOT_FOUND, exception.getErrorCode());
        verify(productPriceRepository, never()).deleteAllByProduct_ProductId(any());
        verify(productRepository, never()).delete(any());
    }

    @Test
    void deleteProduct_DeletesInCorrectOrder_Success() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        doNothing().when(productPriceRepository).deleteAllByProduct_ProductId(productId);
        doNothing().when(inventoryRepository).deleteAllByProduct_ProductId(productId);
        doNothing().when(productRepository).delete(testProduct);

        // When
        productService.deleteProduct(productId);

        // Then
        var inOrder = inOrder(productPriceRepository, inventoryRepository, productRepository);
        inOrder.verify(productPriceRepository).deleteAllByProduct_ProductId(productId);
        inOrder.verify(inventoryRepository).deleteAllByProduct_ProductId(productId);
        inOrder.verify(productRepository).delete(testProduct);
    }

    @Test
    void toggleProductStatus_ActiveToInactive_Success() {
        // Given
        testProduct.setActive(true);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(productMapper.toResponse(any(Product.class))).thenReturn(productResponse);

        // When
        ProductResponse result = productService.toggleProductStatus(productId);

        // Then
        assertNotNull(result);
        verify(productRepository).save(argThat(product -> 
            !product.getActive() && product.getUpdatedDate() != null
        ));
    }

    @Test
    void toggleProductStatus_InactiveToActive_Success() {
        // Given
        testProduct.setActive(false);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(productMapper.toResponse(any(Product.class))).thenReturn(productResponse);

        // When
        ProductResponse result = productService.toggleProductStatus(productId);

        // Then
        assertNotNull(result);
        verify(productRepository).save(argThat(product -> 
            product.getActive() && product.getUpdatedDate() != null
        ));
    }

    @Test
    void toggleProductStatus_NullToActive_Success() {
        // Given
        testProduct.setActive(null);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(productMapper.toResponse(any(Product.class))).thenReturn(productResponse);

        // When
        ProductResponse result = productService.toggleProductStatus(productId);

        // Then
        assertNotNull(result);
        verify(productRepository).save(argThat(product -> 
            product.getActive() != null && product.getActive()
        ));
    }

    @Test
    void toggleProductStatus_NotFound_ThrowsException() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> productService.toggleProductStatus(productId));
        assertEquals(ErrorCode.PRODUCT_NOT_FOUND, exception.getErrorCode());
        verify(productRepository, never()).save(any());
    }

    @Test
    void getAllProducts_Success() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(productMapper.toResponse(any(Product.class))).thenReturn(productResponse);
        
        

        // When
        List<ProductResponse> result = productService.getAllProducts();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productRepository).findAllActiveWithActiveCategory();
    }

    @Test
    void getAllProducts_EmptyList_Success() {
        // Given
        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(Collections.emptyList());

        // When
        List<ProductResponse> result = productService.getAllProducts();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
