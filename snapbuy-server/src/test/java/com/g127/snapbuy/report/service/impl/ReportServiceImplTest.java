package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.report.dto.response.ProductRevenueReportResponse;
import com.g127.snapbuy.order.repository.OrderDetailRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private UUID productId;
    private UUID categoryId;
    private UUID supplierId;
    private UUID accountId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
        supplierId = UUID.randomUUID();
        accountId = UUID.randomUUID();
    }

    @Test
    void getProductRevenue_Success() {
        // Given
        LocalDateTime fromDate = LocalDateTime.now().minusDays(30);
        LocalDateTime toDate = LocalDateTime.now();

        Object[] row = new Object[]{
            productId.toString(), "Product 1", 100, BigDecimal.valueOf(5000000),
            categoryId.toString(), "Category 1", supplierId.toString(), "Supplier 1"
        };

        when(orderDetailRepository.getProductRevenueReport(fromDate, toDate, accountId))
            .thenReturn(Collections.singletonList(row));

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenue(fromDate, toDate, accountId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        ProductRevenueReportResponse response = result.get(0);
        assertEquals(productId, response.getProductId());
        assertEquals("Product 1", response.getProductName());
        assertEquals(100, response.getTotalSold());
        assertEquals(BigDecimal.valueOf(5000000), response.getTotalRevenue());
    }

    @Test
    void getProductRevenue_EmptyResult_Success() {
        // Given
        LocalDateTime fromDate = LocalDateTime.now().minusDays(30);
        LocalDateTime toDate = LocalDateTime.now();

        when(orderDetailRepository.getProductRevenueReport(fromDate, toDate, accountId))
            .thenReturn(Collections.emptyList());

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenue(fromDate, toDate, accountId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getProductRevenue_MultipleProducts_Success() {
        // Given
        LocalDateTime fromDate = LocalDateTime.now().minusDays(30);
        LocalDateTime toDate = LocalDateTime.now();

        Object[] row1 = new Object[]{
            productId.toString(), "Product 1", 100, BigDecimal.valueOf(5000000),
            categoryId.toString(), "Category 1", supplierId.toString(), "Supplier 1"
        };
        Object[] row2 = new Object[]{
            UUID.randomUUID().toString(), "Product 2", 50, BigDecimal.valueOf(2500000),
            categoryId.toString(), "Category 1", supplierId.toString(), "Supplier 1"
        };

        when(orderDetailRepository.getProductRevenueReport(fromDate, toDate, accountId))
            .thenReturn(Arrays.asList(new Object[][]{row1, row2}));

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenue(fromDate, toDate, accountId);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    void getProductRevenue_WithNullValues_HandlesGracefully() {
        // Given
        LocalDateTime fromDate = LocalDateTime.now().minusDays(30);
        LocalDateTime toDate = LocalDateTime.now();

        Object[] row = new Object[]{
            null, "Product 1", null, null,
            null, "Category 1", null, "Supplier 1"
        };

        when(orderDetailRepository.getProductRevenueReport(fromDate, toDate, accountId))
            .thenReturn(Collections.singletonList(row));

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenue(fromDate, toDate, accountId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        ProductRevenueReportResponse response = result.get(0);
        assertNull(response.getProductId());
        assertEquals(0, response.getTotalSold());
        assertEquals(BigDecimal.ZERO, response.getTotalRevenue());
    }

    @Test
    void getProductRevenueFlexible_Success() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        LocalDateTime to = LocalDateTime.now();

        Object[] row = new Object[]{
            productId.toString(), "Product 1", 100, BigDecimal.valueOf(5000000),
            categoryId.toString(), "Category 1", supplierId.toString(), "Supplier 1"
        };

        when(orderDetailRepository.reportProductRevenueFlexible(
            eq(from), eq(to), eq(productId), eq(categoryId), eq(supplierId),
            any(), anyInt(), anyString(), anyString()))
            .thenReturn(Collections.singletonList(row));

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenueFlexible(
            from, to, productId, categoryId, supplierId,
            BigDecimal.valueOf(1000000), 10, "revenue", "desc"
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getProductRevenueFlexible_DefaultParameters_Success() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        LocalDateTime to = LocalDateTime.now();

        Object[] row = new Object[]{
            productId.toString(), "Product 1", 100, BigDecimal.valueOf(5000000),
            categoryId.toString(), "Category 1", supplierId.toString(), "Supplier 1"
        };

        when(orderDetailRepository.reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(50), eq("revenue"), eq("desc")))
            .thenReturn(Collections.singletonList(row));

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenueFlexible(
            from, to, null, null, null, null, null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(orderDetailRepository).reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(50), eq("revenue"), eq("desc")
        );
    }

    @Test
    void getProductRevenueFlexible_InvalidSortBy_UsesDefault() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        LocalDateTime to = LocalDateTime.now();

        when(orderDetailRepository.reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(50), eq("revenue"), eq("desc")))
            .thenReturn(Collections.emptyList());

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenueFlexible(
            from, to, null, null, null, null, null, "invalid", null
        );

        // Then
        assertNotNull(result);
        verify(orderDetailRepository).reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(50), eq("revenue"), eq("desc")
        );
    }

    @Test
    void getProductRevenueFlexible_SortBySold_Success() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        LocalDateTime to = LocalDateTime.now();

        when(orderDetailRepository.reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(50), eq("sold"), eq("asc")))
            .thenReturn(Collections.emptyList());

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenueFlexible(
            from, to, null, null, null, null, null, "sold", "asc"
        );

        // Then
        assertNotNull(result);
        verify(orderDetailRepository).reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(50), eq("sold"), eq("asc")
        );
    }

    @Test
    void getProductRevenueFlexible_CustomLimit_Success() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        LocalDateTime to = LocalDateTime.now();

        when(orderDetailRepository.reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(100), eq("revenue"), eq("desc")))
            .thenReturn(Collections.emptyList());

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenueFlexible(
            from, to, null, null, null, null, 100, null, null
        );

        // Then
        assertNotNull(result);
        verify(orderDetailRepository).reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(100), eq("revenue"), eq("desc")
        );
    }

    @Test
    void getProductRevenueFlexible_InvalidLimit_UsesDefault() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(30);
        LocalDateTime to = LocalDateTime.now();

        when(orderDetailRepository.reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(50), eq("revenue"), eq("desc")))
            .thenReturn(Collections.emptyList());

        // When
        List<ProductRevenueReportResponse> result = reportService.getProductRevenueFlexible(
            from, to, null, null, null, null, -10, null, null
        );

        // Then
        assertNotNull(result);
        verify(orderDetailRepository).reportProductRevenueFlexible(
            eq(from), eq(to), isNull(), isNull(), isNull(),
            isNull(), eq(50), eq("revenue"), eq("desc")
        );
    }
}
