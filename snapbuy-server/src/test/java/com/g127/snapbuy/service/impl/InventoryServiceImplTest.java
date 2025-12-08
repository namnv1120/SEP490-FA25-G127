package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.InventoryCreateRequest;
import com.g127.snapbuy.dto.request.InventoryUpdateRequest;
import com.g127.snapbuy.dto.response.InventoryResponse;
import com.g127.snapbuy.entity.Inventory;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.Category;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.InventoryMapper;
import com.g127.snapbuy.repository.InventoryRepository;
import com.g127.snapbuy.repository.InventoryTransactionRepository;
import com.g127.snapbuy.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private InventoryMapper inventoryMapper;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private Product testProduct;
    private Inventory testInventory;
    private InventoryCreateRequest createRequest;
    private InventoryUpdateRequest updateRequest;
    private InventoryResponse inventoryResponse;
    private UUID productId;
    private UUID inventoryId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        inventoryId = UUID.randomUUID();

        Category category = new Category();
        category.setCategoryId(UUID.randomUUID());
        category.setCategoryName("Test Category");
        category.setActive(true);

        testProduct = new Product();
        testProduct.setProductId(productId);
        testProduct.setProductCode("PROD001");
        testProduct.setProductName("Test Product");
        testProduct.setActive(true);
        testProduct.setCategory(category);

        testInventory = new Inventory();
        testInventory.setInventoryId(inventoryId);
        testInventory.setProduct(testProduct);
        testInventory.setQuantityInStock(100);
        testInventory.setMinimumStock(10);
        testInventory.setMaximumStock(500);
        testInventory.setReorderPoint(50);

        createRequest = new InventoryCreateRequest();
        createRequest.setProductId(productId);
        createRequest.setQuantityInStock(100);
        createRequest.setMinimumStock(10);
        createRequest.setMaximumStock(500);
        createRequest.setReorderPoint(50);

        updateRequest = new InventoryUpdateRequest();
        updateRequest.setMinimumStock(20);
        updateRequest.setMaximumStock(600);
        updateRequest.setReorderPoint(60);

        inventoryResponse = InventoryResponse.builder()
                .inventoryId(inventoryId)
                .productId(productId)
                .quantityInStock(100)
                .minimumStock(10)
                .maximumStock(500)
                .reorderPoint(50)
                .build();
    }

    @Test
    void createInventory_Success() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProduct(testProduct)).thenReturn(Optional.empty());
        when(inventoryMapper.toEntity(any(InventoryCreateRequest.class))).thenReturn(testInventory);
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(testInventory);
        when(inventoryMapper.toResponse(any(Inventory.class))).thenReturn(inventoryResponse);

        // When
        InventoryResponse result = inventoryService.createInventory(createRequest);

        // Then
        assertNotNull(result);
        assertEquals(inventoryResponse.getInventoryId(), result.getInventoryId());
        verify(inventoryRepository).save(any(Inventory.class));
        verify(inventoryTransactionRepository).save(any());
    }

    @Test
    void createInventory_ProductNotFound_ThrowsException() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> inventoryService.createInventory(createRequest));
        assertEquals(ErrorCode.PRODUCT_NOT_FOUND, exception.getErrorCode());
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void createInventory_InventoryAlreadyExists_ThrowsException() {
        // Given
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProduct(testProduct)).thenReturn(Optional.of(testInventory));

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> inventoryService.createInventory(createRequest));
        assertEquals(ErrorCode.CODE_EXISTED, exception.getErrorCode());
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void createInventory_NegativeStock_ThrowsException() {
        // Given
        createRequest.setQuantityInStock(-10);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProduct(testProduct)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> inventoryService.createInventory(createRequest));
        assertEquals(ErrorCode.INVALID_STOCK_OPERATION, exception.getErrorCode());
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void createInventory_MinimumGreaterThanMaximum_ThrowsException() {
        // Given
        createRequest.setMinimumStock(600);
        createRequest.setMaximumStock(500);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProduct(testProduct)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> inventoryService.createInventory(createRequest));
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void createInventory_ReorderPointLessThanMinimum_ThrowsException() {
        // Given
        createRequest.setMinimumStock(100);
        createRequest.setReorderPoint(50);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProduct(testProduct)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> inventoryService.createInventory(createRequest));
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void createInventory_ReorderPointGreaterThanMaximum_ThrowsException() {
        // Given
        createRequest.setMaximumStock(100);
        createRequest.setReorderPoint(150);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProduct(testProduct)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> inventoryService.createInventory(createRequest));
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void updateInventory_Success() {
        // Given
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(testInventory);
        when(inventoryMapper.toResponse(any(Inventory.class))).thenReturn(inventoryResponse);

        // When
        InventoryResponse result = inventoryService.updateInventory(inventoryId, updateRequest);

        // Then
        assertNotNull(result);
        verify(inventoryRepository).save(any(Inventory.class));
    }

    @Test
    void updateInventory_InventoryNotFound_ThrowsException() {
        // Given
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> inventoryService.updateInventory(inventoryId, updateRequest));
        assertEquals(ErrorCode.INVENTORY_NOT_FOUND, exception.getErrorCode());
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void updateInventory_InvalidStockLevels_ThrowsException() {
        // Given
        updateRequest.setMinimumStock(700);
        updateRequest.setMaximumStock(600);
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(testInventory));

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> inventoryService.updateInventory(inventoryId, updateRequest));
        verify(inventoryRepository, never()).save(any(Inventory.class));
    }

    @Test
    void getInventoryById_Success() {
        // Given
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(testInventory));
        when(inventoryMapper.toResponse(any(Inventory.class))).thenReturn(inventoryResponse);

        // When
        InventoryResponse result = inventoryService.getInventoryById(inventoryId);

        // Then
        assertNotNull(result);
        assertEquals(inventoryResponse.getInventoryId(), result.getInventoryId());
    }

    @Test
    void getInventoryById_NotFound_ThrowsException() {
        // Given
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> inventoryService.getInventoryById(inventoryId));
        assertEquals(ErrorCode.INVENTORY_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getAllInventories_Success() {
        // Given
        List<Inventory> inventories = Arrays.asList(testInventory);
        when(inventoryRepository.findAll()).thenReturn(inventories);
        when(inventoryMapper.toResponse(any(Inventory.class))).thenReturn(inventoryResponse);

        // When
        List<InventoryResponse> result = inventoryService.getAllInventories();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAllInventories_FilterInactiveProducts() {
        // Given
        Product inactiveProduct = new Product();
        inactiveProduct.setProductId(UUID.randomUUID());
        inactiveProduct.setActive(false);

        Inventory inactiveInventory = new Inventory();
        inactiveInventory.setInventoryId(UUID.randomUUID());
        inactiveInventory.setProduct(inactiveProduct);

        List<Inventory> inventories = Arrays.asList(testInventory, inactiveInventory);
        when(inventoryRepository.findAll()).thenReturn(inventories);
        when(inventoryMapper.toResponse(testInventory)).thenReturn(inventoryResponse);

        // When
        List<InventoryResponse> result = inventoryService.getAllInventories();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void deleteInventory_Success() {
        // Given
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.of(testInventory));

        // When
        inventoryService.deleteInventory(inventoryId);

        // Then
        verify(inventoryRepository).delete(testInventory);
        verify(inventoryTransactionRepository).save(any());
    }

    @Test
    void deleteInventory_NotFound_ThrowsException() {
        // Given
        when(inventoryRepository.findById(inventoryId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> inventoryService.deleteInventory(inventoryId));
        assertEquals(ErrorCode.INVENTORY_NOT_FOUND, exception.getErrorCode());
        verify(inventoryRepository, never()).delete(any(Inventory.class));
    }
}
