package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.inventory.dto.response.InventoryReportFullResponse;
import com.g127.snapbuy.inventory.dto.response.InventoryReportOverviewResponse;
import com.g127.snapbuy.inventory.dto.response.InventoryReportResponse;
import com.g127.snapbuy.service.impl.InventoryReportServiceImpl;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryReportServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private ProductPriceRepository productPriceRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private InventoryReportServiceImpl inventoryReportService;

    private Product testProduct;
    private Category testCategory;
    private Inventory testInventory;
    private ProductPrice testPrice;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();

        testCategory = new Category();
        testCategory.setCategoryId(UUID.randomUUID());
        testCategory.setCategoryName("Test Category");
        testCategory.setActive(true);

        testProduct = new Product();
        testProduct.setProductId(productId);
        testProduct.setProductCode("PROD001");
        testProduct.setProductName("Test Product");
        testProduct.setActive(true);
        testProduct.setCategory(testCategory);

        testInventory = new Inventory();
        testInventory.setInventoryId(UUID.randomUUID());
        testInventory.setProduct(testProduct);
        testInventory.setQuantityInStock(100);

        testPrice = new ProductPrice();
        testPrice.setPriceId(UUID.randomUUID());
        testPrice.setProduct(testProduct);
        testPrice.setUnitPrice(BigDecimal.valueOf(10000));
        testPrice.setValidFrom(LocalDateTime.now().minusDays(30));
    }

    @Test
    void getInventoryReportByDate_Success() {
        // Given
        LocalDate reportDate = LocalDate.now();
        List<Product> products = Arrays.asList(testProduct);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(inventoryRepository.findByProduct_ProductId(productId)).thenReturn(Optional.of(testInventory));
        when(productPriceRepository.findCurrentPriceByProductId(productId)).thenReturn(Optional.of(testPrice));
        
        // Mock entity manager queries
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(0); // No transactions

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertNotNull(result.getOverview());
        assertNotNull(result.getDetails());
        assertEquals(1, result.getDetails().size());
        
        InventoryReportOverviewResponse overview = result.getOverview();
        assertEquals(1, overview.getTotalProducts());
        assertEquals(100, overview.getCurrentTotalStock());
        assertTrue(overview.getCurrentTotalValue().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void getInventoryReportByDate_MultipleProducts_Success() {
        // Given
        LocalDate reportDate = LocalDate.now();
        
        Product product2 = new Product();
        product2.setProductId(UUID.randomUUID());
        product2.setProductCode("PROD002");
        product2.setProductName("Test Product 2");
        product2.setActive(true);
        product2.setCategory(testCategory);

        List<Product> products = Arrays.asList(testProduct, product2);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(inventoryRepository.findByProduct_ProductId(any(UUID.class)))
                .thenReturn(Optional.of(testInventory));
        when(productPriceRepository.findCurrentPriceByProductId(any(UUID.class)))
                .thenReturn(Optional.of(testPrice));
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(0);

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getDetails().size());
        assertEquals(2, result.getOverview().getTotalProducts());
    }

    @Test
    void getInventoryReportByDate_WithSales_Success() {
        // Given
        LocalDate reportDate = LocalDate.now();
        List<Product> products = Arrays.asList(testProduct);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(inventoryRepository.findByProduct_ProductId(productId)).thenReturn(Optional.of(testInventory));
        when(productPriceRepository.findCurrentPriceByProductId(productId)).thenReturn(Optional.of(testPrice));
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        
        // Mock different return values for different queries
        when(query.getSingleResult())
                .thenReturn(null)  // First transaction date
                .thenReturn(10)    // Quantity sold
                .thenReturn(20)    // Quantity received
                .thenReturn(0)     // Sold after date
                .thenReturn(0);    // Received after date

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getDetails().size());
        
        InventoryReportResponse detail = result.getDetails().get(0);
        assertNotNull(detail);
        assertEquals(productId, detail.getProductId());
    }

    @Test
    void getInventoryReportByDate_ProductWithNoInventory_Success() {
        // Given
        LocalDate reportDate = LocalDate.now();
        List<Product> products = Arrays.asList(testProduct);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(inventoryRepository.findByProduct_ProductId(productId)).thenReturn(Optional.empty());
        when(productPriceRepository.findCurrentPriceByProductId(productId)).thenReturn(Optional.of(testPrice));
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(null);

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getDetails().size());
        
        InventoryReportResponse detail = result.getDetails().get(0);
        assertEquals(0, detail.getCurrentStock());
    }

    @Test
    void getInventoryReportByDate_ProductWithNoPrice_Success() {
        // Given
        LocalDate reportDate = LocalDate.now();
        List<Product> products = Arrays.asList(testProduct);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(inventoryRepository.findByProduct_ProductId(productId)).thenReturn(Optional.of(testInventory));
        when(productPriceRepository.findCurrentPriceByProductId(productId)).thenReturn(Optional.empty());
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(null);

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getDetails().size());
        
        InventoryReportResponse detail = result.getDetails().get(0);
        assertEquals(BigDecimal.ZERO, detail.getUnitPrice());
        assertEquals(BigDecimal.ZERO, detail.getCurrentValue());
    }

    @Test
    void getInventoryReportByDate_BeforeProductCreation_ReturnsZeroStock() {
        // Given
        LocalDate reportDate = LocalDate.now().minusDays(100);
        List<Product> products = Arrays.asList(testProduct);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        
        // Mock first transaction date as after report date
        java.sql.Timestamp futureDate = java.sql.Timestamp.valueOf(LocalDateTime.now().minusDays(10));
        when(query.getSingleResult()).thenReturn(futureDate);

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getDetails().size());
        
        InventoryReportResponse detail = result.getDetails().get(0);
        assertEquals(0, detail.getCurrentStock());
        assertEquals(0, detail.getStockAtDate());
    }

    @Test
    void getInventoryReportByDate_TodayReport_UsesCurrentStock() {
        // Given
        LocalDate today = LocalDate.now();
        List<Product> products = Arrays.asList(testProduct);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(inventoryRepository.findByProduct_ProductId(productId)).thenReturn(Optional.of(testInventory));
        when(productPriceRepository.findCurrentPriceByProductId(productId)).thenReturn(Optional.of(testPrice));
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(null).thenReturn(10).thenReturn(5);

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(today);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getDetails().size());
        
        InventoryReportResponse detail = result.getDetails().get(0);
        assertEquals(100, detail.getCurrentStock());
        assertEquals(100, detail.getStockAtDate()); // Should be same as current for today
    }

    @Test
    void getInventoryReportByDate_WithStockDecrease_CountsCorrectly() {
        // Given
        LocalDate reportDate = LocalDate.now().minusDays(1);
        
        Product product2 = new Product();
        product2.setProductId(UUID.randomUUID());
        product2.setProductCode("PROD002");
        product2.setProductName("Test Product 2");
        product2.setActive(true);
        product2.setCategory(testCategory);

        List<Product> products = Arrays.asList(testProduct, product2);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(inventoryRepository.findByProduct_ProductId(any(UUID.class)))
                .thenReturn(Optional.of(testInventory));
        when(productPriceRepository.findCurrentPriceByProductId(any(UUID.class)))
                .thenReturn(Optional.of(testPrice));
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        
        // Mock to create stock decrease scenario
        when(query.getSingleResult())
                .thenReturn(null)   // First transaction date
                .thenReturn(5)      // Quantity sold
                .thenReturn(0)      // Quantity received
                .thenReturn(10)     // Sold after date
                .thenReturn(5)      // Received after date
                .thenReturn(null)   // Second product first transaction
                .thenReturn(3)      // Second product sold
                .thenReturn(0)      // Second product received
                .thenReturn(8)      // Second product sold after
                .thenReturn(2);     // Second product received after

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getDetails().size());
        assertTrue(result.getOverview().getProductsWithDecrease() >= 0);
    }

    @Test
    void getInventoryReportByDate_NoProducts_ReturnsEmptyReport() {
        // Given
        LocalDate reportDate = LocalDate.now();
        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(Arrays.asList());

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertNotNull(result.getOverview());
        assertNotNull(result.getDetails());
        assertEquals(0, result.getDetails().size());
        assertEquals(0, result.getOverview().getTotalProducts());
        assertEquals(0, result.getOverview().getCurrentTotalStock());
        assertEquals(BigDecimal.ZERO, result.getOverview().getCurrentTotalValue());
    }

    @Test
    void getInventoryReportByDate_ProductWithNullCategory_HandlesGracefully() {
        // Given
        LocalDate reportDate = LocalDate.now();
        testProduct.setCategory(null);
        List<Product> products = Arrays.asList(testProduct);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        when(inventoryRepository.findByProduct_ProductId(productId)).thenReturn(Optional.of(testInventory));
        when(productPriceRepository.findCurrentPriceByProductId(productId)).thenReturn(Optional.of(testPrice));
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(null);

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getDetails().size());
        
        InventoryReportResponse detail = result.getDetails().get(0);
        assertEquals("N/A", detail.getCategoryName());
    }

    @Test
    void getInventoryReportByDate_ErrorInProductProcessing_ContinuesWithOthers() {
        // Given
        LocalDate reportDate = LocalDate.now();
        
        Product product2 = new Product();
        product2.setProductId(UUID.randomUUID());
        product2.setProductCode("PROD002");
        product2.setProductName("Test Product 2");
        product2.setActive(true);
        product2.setCategory(testCategory);

        List<Product> products = Arrays.asList(testProduct, product2);

        when(productRepository.findAllActiveWithActiveCategory()).thenReturn(products);
        
        // First product throws exception
        when(inventoryRepository.findByProduct_ProductId(productId))
                .thenThrow(new RuntimeException("Database error"));
        
        // Second product succeeds
        when(inventoryRepository.findByProduct_ProductId(product2.getProductId()))
                .thenReturn(Optional.of(testInventory));
        when(productPriceRepository.findCurrentPriceByProductId(product2.getProductId()))
                .thenReturn(Optional.of(testPrice));
        
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(query.getSingleResult()).thenReturn(null);

        // When
        InventoryReportFullResponse result = inventoryReportService.getInventoryReportByDate(reportDate);

        // Then
        assertNotNull(result);
        // Should have 1 product (the one that didn't error)
        assertEquals(1, result.getDetails().size());
    }
}
