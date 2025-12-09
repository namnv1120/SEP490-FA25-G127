package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.report.dto.response.SupplierReportResponse;
import com.g127.snapbuy.repository.SupplierRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierReportServiceImplTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierReportServiceImpl supplierReportService;

    @BeforeEach
    void setUp() {
        // Setup common mocks if needed
    }

    @Test
    void getDailySupplierReport_Success() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);
        Long supplierCount = 5L;
        BigDecimal totalAmount = BigDecimal.valueOf(10000000);
        Long uniqueProducts = 20L;
        Long totalQuantity = 500L;

        Object[] supplierData = new Object[]{
            "supplier-id-1", "SUP001", "Supplier 1", "0123456789",
            10L, 200L, BigDecimal.valueOf(5000000)
        };

        when(supplierRepository.countSuppliersByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(supplierCount);
        when(supplierRepository.sumTotalAmount(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(totalAmount);
        when(supplierRepository.countUniqueProductsReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(uniqueProducts);
        when(supplierRepository.sumTotalQuantityReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(totalQuantity);
        when(supplierRepository.getSupplierProductDetails(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Collections.singletonList(supplierData));

        // When
        SupplierReportResponse result = supplierReportService.getDailySupplierReport(date);

        // Then
        assertNotNull(result);
        assertEquals(supplierCount, result.getSupplierCount());
        assertEquals(totalAmount, result.getTotalAmount());
        assertEquals(uniqueProducts, result.getUniqueProductsCount());
        assertEquals(totalQuantity, result.getTotalQuantityReceived());
        assertEquals("NGÀY", result.getPeriod());
        assertEquals(1, result.getSupplierDetails().size());
    }

    @Test
    void getDailySupplierReport_NoData_ReturnsZero() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);

        when(supplierRepository.countSuppliersByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(null);
        when(supplierRepository.sumTotalAmount(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(null);
        when(supplierRepository.countUniqueProductsReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(null);
        when(supplierRepository.sumTotalQuantityReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(null);
        when(supplierRepository.getSupplierProductDetails(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Collections.emptyList());

        // When
        SupplierReportResponse result = supplierReportService.getDailySupplierReport(date);

        // Then
        assertNotNull(result);
        assertEquals(0L, result.getSupplierCount());
        assertEquals(BigDecimal.ZERO, result.getTotalAmount());
        assertEquals(0L, result.getUniqueProductsCount());
        assertEquals(0L, result.getTotalQuantityReceived());
        assertTrue(result.getSupplierDetails().isEmpty());
    }

    @Test
    void getMonthlySupplierReport_Success() {
        // Given
        int year = 2025;
        int month = 12;
        Long supplierCount = 15L;
        BigDecimal totalAmount = BigDecimal.valueOf(300000000);
        Long uniqueProducts = 100L;
        Long totalQuantity = 15000L;

        Object[] supplierData = new Object[]{
            "supplier-id-1", "SUP001", "Supplier 1", "0123456789",
            50L, 7500L, BigDecimal.valueOf(150000000)
        };

        when(supplierRepository.countSuppliersByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(supplierCount);
        when(supplierRepository.sumTotalAmount(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(totalAmount);
        when(supplierRepository.countUniqueProductsReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(uniqueProducts);
        when(supplierRepository.sumTotalQuantityReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(totalQuantity);
        when(supplierRepository.getSupplierProductDetails(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Collections.singletonList(supplierData));

        // When
        SupplierReportResponse result = supplierReportService.getMonthlySupplierReport(year, month);

        // Then
        assertNotNull(result);
        assertEquals(supplierCount, result.getSupplierCount());
        assertEquals(totalAmount, result.getTotalAmount());
        assertEquals("THÁNG", result.getPeriod());
    }

    @Test
    void getYearlySupplierReport_Success() {
        // Given
        int year = 2025;
        Long supplierCount = 50L;
        BigDecimal totalAmount = BigDecimal.valueOf(3600000000L);
        Long uniqueProducts = 500L;
        Long totalQuantity = 180000L;

        Object[] supplierData = new Object[]{
            "supplier-id-1", "SUP001", "Supplier 1", "0123456789",
            250L, 90000L, BigDecimal.valueOf(1800000000L)
        };

        when(supplierRepository.countSuppliersByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(supplierCount);
        when(supplierRepository.sumTotalAmount(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(totalAmount);
        when(supplierRepository.countUniqueProductsReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(uniqueProducts);
        when(supplierRepository.sumTotalQuantityReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(totalQuantity);
        when(supplierRepository.getSupplierProductDetails(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Collections.singletonList(supplierData));

        // When
        SupplierReportResponse result = supplierReportService.getYearlySupplierReport(year);

        // Then
        assertNotNull(result);
        assertEquals(supplierCount, result.getSupplierCount());
        assertEquals(totalAmount, result.getTotalAmount());
        assertEquals("NĂM", result.getPeriod());
    }

    @Test
    void getCustomSupplierReport_Success() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 12, 1);
        LocalDate endDate = LocalDate.of(2025, 12, 31);
        Long supplierCount = 20L;
        BigDecimal totalAmount = BigDecimal.valueOf(500000000);
        Long uniqueProducts = 150L;
        Long totalQuantity = 25000L;

        Object[] supplierData = new Object[]{
            "supplier-id-1", "SUP001", "Supplier 1", "0123456789",
            75L, 12500L, BigDecimal.valueOf(250000000)
        };

        when(supplierRepository.countSuppliersByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(supplierCount);
        when(supplierRepository.sumTotalAmount(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(totalAmount);
        when(supplierRepository.countUniqueProductsReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(uniqueProducts);
        when(supplierRepository.sumTotalQuantityReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(totalQuantity);
        when(supplierRepository.getSupplierProductDetails(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Collections.singletonList(supplierData));

        // When
        SupplierReportResponse result = supplierReportService.getCustomSupplierReport(startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(supplierCount, result.getSupplierCount());
        assertEquals(totalAmount, result.getTotalAmount());
        assertEquals("TUỲ CHỈNH", result.getPeriod());
    }

    @Test
    void getDailySupplierReport_MultipleSuppliers_Success() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);
        
        Object[] supplier1 = new Object[]{
            "supplier-id-1", "SUP001", "Supplier 1", "0123456789",
            10L, 200L, BigDecimal.valueOf(5000000)
        };
        Object[] supplier2 = new Object[]{
            "supplier-id-2", "SUP002", "Supplier 2", "0987654321",
            15L, 300L, BigDecimal.valueOf(7500000)
        };

        when(supplierRepository.countSuppliersByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(2L);
        when(supplierRepository.sumTotalAmount(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(BigDecimal.valueOf(12500000));
        when(supplierRepository.countUniqueProductsReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(25L);
        when(supplierRepository.sumTotalQuantityReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(500L);
        when(supplierRepository.getSupplierProductDetails(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Arrays.asList(new Object[][]{supplier1, supplier2}));

        // When
        SupplierReportResponse result = supplierReportService.getDailySupplierReport(date);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getSupplierDetails().size());
    }

    @Test
    void getDailySupplierReport_WithNullValues_HandlesGracefully() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);
        
        Object[] supplierDataWithNulls = new Object[]{
            "supplier-id-1", null, null, null,
            10L, null, null
        };

        when(supplierRepository.countSuppliersByDateRange(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(1L);
        when(supplierRepository.sumTotalAmount(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(BigDecimal.ZERO);
        when(supplierRepository.countUniqueProductsReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(10L);
        when(supplierRepository.sumTotalQuantityReceived(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(0L);
        when(supplierRepository.getSupplierProductDetails(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(Collections.singletonList(supplierDataWithNulls));

        // When
        SupplierReportResponse result = supplierReportService.getDailySupplierReport(date);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getSupplierDetails().size());
        SupplierReportResponse.SupplierProductDetail detail = result.getSupplierDetails().get(0);
        assertEquals("N/A", detail.getSupplierCode());
        assertEquals("N/A", detail.getSupplierName());
        assertEquals(0L, detail.getTotalQuantityReceived());
        assertEquals(BigDecimal.ZERO, detail.getTotalAmount());
    }
}
