package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.report.dto.response.RevenueResponse;
import com.g127.snapbuy.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RevenueServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private RevenueServiceImpl revenueService;

    private static final String PAID_STATUS = "Đã thanh toán";

    @BeforeEach
    void setUp() {
        // Setup common mocks if needed
    }

    @Test
    void getDailyRevenue_Success() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);
        BigDecimal expectedRevenue = BigDecimal.valueOf(1000000);
        Long expectedCount = 10L;

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedRevenue);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedCount);

        // When
        RevenueResponse result = revenueService.getDailyRevenue(date);

        // Then
        assertNotNull(result);
        assertEquals(expectedRevenue, result.getTotalRevenue());
        assertEquals(expectedCount, result.getOrderCount());
        assertEquals("NGÀY", result.getPeriod());
        verify(orderRepository).sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS));
        verify(orderRepository).countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS));
    }

    @Test
    void getDailyRevenue_NoOrders_ReturnsZero() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);

        // When
        RevenueResponse result = revenueService.getDailyRevenue(date);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.getTotalRevenue());
        assertEquals(0L, result.getOrderCount());
    }

    @Test
    void getMonthlyRevenue_Success() {
        // Given
        int year = 2025;
        int month = 12;
        BigDecimal expectedRevenue = BigDecimal.valueOf(30000000);
        Long expectedCount = 300L;

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedRevenue);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedCount);

        // When
        RevenueResponse result = revenueService.getMonthlyRevenue(year, month);

        // Then
        assertNotNull(result);
        assertEquals(expectedRevenue, result.getTotalRevenue());
        assertEquals(expectedCount, result.getOrderCount());
        assertEquals("THÁNG", result.getPeriod());
    }

    @Test
    void getMonthlyRevenue_NoOrders_ReturnsZero() {
        // Given
        int year = 2025;
        int month = 12;

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);

        // When
        RevenueResponse result = revenueService.getMonthlyRevenue(year, month);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.getTotalRevenue());
        assertEquals(0L, result.getOrderCount());
    }

    @Test
    void getYearlyRevenue_Success() {
        // Given
        int year = 2025;
        BigDecimal expectedRevenue = BigDecimal.valueOf(360000000);
        Long expectedCount = 3600L;

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedRevenue);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedCount);

        // When
        RevenueResponse result = revenueService.getYearlyRevenue(year);

        // Then
        assertNotNull(result);
        assertEquals(expectedRevenue, result.getTotalRevenue());
        assertEquals(expectedCount, result.getOrderCount());
        assertEquals("NĂM", result.getPeriod());
    }

    @Test
    void getYearlyRevenue_NoOrders_ReturnsZero() {
        // Given
        int year = 2025;

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);

        // When
        RevenueResponse result = revenueService.getYearlyRevenue(year);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.getTotalRevenue());
        assertEquals(0L, result.getOrderCount());
    }

    @Test
    void getCustomRevenue_Success() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 12, 1);
        LocalDate endDate = LocalDate.of(2025, 12, 31);
        BigDecimal expectedRevenue = BigDecimal.valueOf(50000000);
        Long expectedCount = 500L;

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedRevenue);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedCount);

        // When
        RevenueResponse result = revenueService.getCustomRevenue(startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(expectedRevenue, result.getTotalRevenue());
        assertEquals(expectedCount, result.getOrderCount());
        assertEquals("TUỲ CHỈNH", result.getPeriod());
    }

    @Test
    void getCustomRevenue_NoOrders_ReturnsZero() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 12, 1);
        LocalDate endDate = LocalDate.of(2025, 12, 31);

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(null);

        // When
        RevenueResponse result = revenueService.getCustomRevenue(startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, result.getTotalRevenue());
        assertEquals(0L, result.getOrderCount());
    }

    @Test
    void getCustomRevenue_SingleDay_Success() {
        // Given
        LocalDate date = LocalDate.of(2025, 12, 9);
        BigDecimal expectedRevenue = BigDecimal.valueOf(1000000);
        Long expectedCount = 10L;

        when(orderRepository.sumRevenueByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedRevenue);
        when(orderRepository.countOrdersByDateRangeAndPaymentStatus(
            any(LocalDateTime.class), any(LocalDateTime.class), eq(PAID_STATUS)))
            .thenReturn(expectedCount);

        // When
        RevenueResponse result = revenueService.getCustomRevenue(date, date);

        // Then
        assertNotNull(result);
        assertEquals(expectedRevenue, result.getTotalRevenue());
        assertEquals(expectedCount, result.getOrderCount());
    }
}
