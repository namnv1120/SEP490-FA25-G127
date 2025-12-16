package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.report.dto.response.ProductReportResponse;
import com.g127.snapbuy.order.repository.OrderDetailRepository;
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
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductReportServiceImplTest {

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @InjectMocks
    private ProductReportServiceImpl productReportService;

    private static final String PAID_STATUS = "Đã thanh toán";

    @BeforeEach
    void setUp() {
        // Setup common mocks if needed
    }

    @Test
    void getDailyProductReport_Success() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);
        Long totalSold = 100L;
        Long uniqueCount = 10L;

        Object[] productData = new Object[]{
            "product-id-1", "Product 1", "PROD001", 50L,
            "Category 1", "Supplier 1", BigDecimal.valueOf(100000), BigDecimal.valueOf(80000)
        };

        when(orderDetailRepository.sumTotalQuantitySold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(totalSold);
        when(orderDetailRepository.countUniqueProductsSold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(uniqueCount);
        when(orderDetailRepository.getProductSalesByDateRange(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(Collections.singletonList(productData));

        // When
        ProductReportResponse result = productReportService.getDailyProductReport(date);

        // Then
        assertNotNull(result);
        assertEquals(totalSold, result.getTotalProductsSold());
        assertEquals(uniqueCount, result.getUniqueProductsCount());
        assertEquals("NGÀY", result.getPeriod());
        assertEquals(1, result.getProductDetails().size());
    }

    @Test
    void getDailyProductReport_NoSales_ReturnsZero() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);

        when(orderDetailRepository.sumTotalQuantitySold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);
        when(orderDetailRepository.countUniqueProductsSold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);
        when(orderDetailRepository.getProductSalesByDateRange(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(Collections.emptyList());

        // When
        ProductReportResponse result = productReportService.getDailyProductReport(date);

        // Then
        assertNotNull(result);
        assertEquals(0L, result.getTotalProductsSold());
        assertEquals(0L, result.getUniqueProductsCount());
        assertTrue(result.getProductDetails().isEmpty());
    }

    @Test
    void getMonthlyProductReport_Success() {
        // Given
        int year = 2025;
        int month = 12;
        Long totalSold = 3000L;
        Long uniqueCount = 50L;

        Object[] productData = new Object[]{
            "product-id-1", "Product 1", "PROD001", 1500L,
            "Category 1", "Supplier 1", BigDecimal.valueOf(100000), BigDecimal.valueOf(80000)
        };

        when(orderDetailRepository.sumTotalQuantitySold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(totalSold);
        when(orderDetailRepository.countUniqueProductsSold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(uniqueCount);
        when(orderDetailRepository.getProductSalesByDateRange(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(Collections.singletonList(productData));

        // When
        ProductReportResponse result = productReportService.getMonthlyProductReport(year, month);

        // Then
        assertNotNull(result);
        assertEquals(totalSold, result.getTotalProductsSold());
        assertEquals(uniqueCount, result.getUniqueProductsCount());
        assertEquals("THÁNG", result.getPeriod());
    }

    @Test
    void getMonthlyProductReport_NoSales_ReturnsZero() {
        // Given
        int year = 2025;
        int month = 12;

        when(orderDetailRepository.sumTotalQuantitySold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);
        when(orderDetailRepository.countUniqueProductsSold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);
        when(orderDetailRepository.getProductSalesByDateRange(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(Collections.emptyList());

        // When
        ProductReportResponse result = productReportService.getMonthlyProductReport(year, month);

        // Then
        assertNotNull(result);
        assertEquals(0L, result.getTotalProductsSold());
        assertEquals(0L, result.getUniqueProductsCount());
    }

    @Test
    void getYearlyProductReport_Success() {
        // Given
        int year = 2025;
        Long totalSold = 36000L;
        Long uniqueCount = 100L;

        Object[] productData = new Object[]{
            "product-id-1", "Product 1", "PROD001", 18000L,
            "Category 1", "Supplier 1", BigDecimal.valueOf(100000), BigDecimal.valueOf(80000)
        };

        when(orderDetailRepository.sumTotalQuantitySold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(totalSold);
        when(orderDetailRepository.countUniqueProductsSold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(uniqueCount);
        when(orderDetailRepository.getProductSalesByDateRange(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(Collections.singletonList(productData));

        // When
        ProductReportResponse result = productReportService.getYearlyProductReport(year);

        // Then
        assertNotNull(result);
        assertEquals(totalSold, result.getTotalProductsSold());
        assertEquals(uniqueCount, result.getUniqueProductsCount());
        assertEquals("NĂM", result.getPeriod());
    }

    @Test
    void getCustomProductReport_Success() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 12, 1);
        LocalDate endDate = LocalDate.of(2025, 12, 31);
        Long totalSold = 5000L;
        Long uniqueCount = 75L;

        Object[] productData = new Object[]{
            "product-id-1", "Product 1", "PROD001", 2500L,
            "Category 1", "Supplier 1", BigDecimal.valueOf(100000), BigDecimal.valueOf(80000)
        };

        when(orderDetailRepository.sumTotalQuantitySold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(totalSold);
        when(orderDetailRepository.countUniqueProductsSold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(uniqueCount);
        when(orderDetailRepository.getProductSalesByDateRange(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(Collections.singletonList(productData));

        // When
        ProductReportResponse result = productReportService.getCustomProductReport(startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(totalSold, result.getTotalProductsSold());
        assertEquals(uniqueCount, result.getUniqueProductsCount());
        assertEquals("TUỲ CHỈNH", result.getPeriod());
    }

    @Test
    void getDailyProductReport_MultipleProducts_Success() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);
        Long totalSold = 150L;
        Long uniqueCount = 3L;

        Object[] product1 = new Object[]{
            "product-id-1", "Product 1", "PROD001", 50L,
            "Category 1", "Supplier 1", BigDecimal.valueOf(100000), BigDecimal.valueOf(80000)
        };
        Object[] product2 = new Object[]{
            "product-id-2", "Product 2", "PROD002", 60L,
            "Category 2", "Supplier 2", BigDecimal.valueOf(150000), BigDecimal.valueOf(120000)
        };
        Object[] product3 = new Object[]{
            "product-id-3", "Product 3", "PROD003", 40L,
            "Category 1", "Supplier 1", BigDecimal.valueOf(80000), BigDecimal.valueOf(60000)
        };

        when(orderDetailRepository.sumTotalQuantitySold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(totalSold);
        when(orderDetailRepository.countUniqueProductsSold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(uniqueCount);
        when(orderDetailRepository.getProductSalesByDateRange(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(Arrays.asList(new Object[][]{product1, product2, product3}));

        // When
        ProductReportResponse result = productReportService.getDailyProductReport(date);

        // Then
        assertNotNull(result);
        assertEquals(3, result.getProductDetails().size());
        assertEquals(totalSold, result.getTotalProductsSold());
        assertEquals(uniqueCount, result.getUniqueProductsCount());
    }

    @Test
    void getDailyProductReport_WithNullValues_HandlesGracefully() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);
        
        Object[] productDataWithNulls = new Object[]{
            null, null, null, 50L,
            null, null, null, null
        };

        when(orderDetailRepository.sumTotalQuantitySold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(50L);
        when(orderDetailRepository.countUniqueProductsSold(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(1L);
        when(orderDetailRepository.getProductSalesByDateRange(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(Collections.singletonList(productDataWithNulls));

        // When
        ProductReportResponse result = productReportService.getDailyProductReport(date);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getProductDetails().size());
        ProductReportResponse.ProductSalesDetail detail = result.getProductDetails().get(0);
        assertEquals("", detail.getProductId());
        assertEquals("", detail.getProductName());
        assertEquals("N/A", detail.getCategoryName());
    }
}
