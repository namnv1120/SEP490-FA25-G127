package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.report.dto.response.CustomerReportResponse;
import com.g127.snapbuy.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerReportServiceImplTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerReportServiceImpl customerReportService;

    private List<Object[]> mockCustomerData;

    @BeforeEach
    void setUp() {
        // Setup mock customer data
        Object[] customerRow = new Object[]{
            UUID.randomUUID().toString(),  // customerId
            "CUS001",                       // customerCode
            "Test Customer",                // customerName
            "0123456789",                   // phone
            5L,                             // productsPurchasedCount
            10L                             // totalQuantityPurchased
        };
        mockCustomerData = Arrays.<Object[]>asList(customerRow);
    }

    @Test
    void getDailyCustomerReport_Success() {
        // Given
        LocalDate date = LocalDate.of(2025, 1, 15);
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(10L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(50L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getDailyCustomerReport(date);

        // Then
        assertNotNull(result);
        assertEquals(10L, result.getCustomerCount());
        assertEquals(50L, result.getTotalProductsPurchased());
        assertEquals("NGÀY", result.getPeriod());
        assertEquals(1, result.getCustomerDetails().size());
        
        CustomerReportResponse.CustomerPurchaseDetail detail = result.getCustomerDetails().get(0);
        assertEquals("CUS001", detail.getCustomerCode());
        assertEquals("Test Customer", detail.getCustomerName());
        assertEquals("0123456789", detail.getPhone());
        assertEquals(5L, detail.getProductsPurchasedCount());
        assertEquals(10L, detail.getTotalQuantityPurchased());
    }

    @Test
    void getDailyCustomerReport_NoCustomers_ReturnsZeroCounts() {
        // Given
        LocalDate date = LocalDate.of(2025, 1, 15);
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(null);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(null);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(Collections.<Object[]>emptyList());

        // When
        CustomerReportResponse result = customerReportService.getDailyCustomerReport(date);

        // Then
        assertNotNull(result);
        assertEquals(0L, result.getCustomerCount());
        assertEquals(0L, result.getTotalProductsPurchased());
        assertTrue(result.getCustomerDetails().isEmpty());
    }

    @Test
    void getDailyCustomerReport_WithNullFields_HandlesGracefully() {
        // Given
        LocalDate date = LocalDate.of(2025, 1, 15);
        Object[] customerRowWithNulls = new Object[]{
            UUID.randomUUID().toString(),
            null,           // customerCode
            null,           // customerName
            null,           // phone
            3L,
            null            // totalQuantityPurchased
        };
        
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(5L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(15L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString()))
            .thenReturn(Arrays.<Object[]>asList(customerRowWithNulls));

        // When
        CustomerReportResponse result = customerReportService.getDailyCustomerReport(date);

        // Then
        assertNotNull(result);
        CustomerReportResponse.CustomerPurchaseDetail detail = result.getCustomerDetails().get(0);
        assertEquals("N/A", detail.getCustomerCode());
        assertEquals("N/A", detail.getCustomerName());
        assertEquals("N/A", detail.getPhone());
        assertEquals(0L, detail.getTotalQuantityPurchased());
    }

    @Test
    void getMonthlyCustomerReport_Success() {
        // Given
        int year = 2025;
        int month = 1;
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(100L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(500L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getMonthlyCustomerReport(year, month);

        // Then
        assertNotNull(result);
        assertEquals(100L, result.getCustomerCount());
        assertEquals(500L, result.getTotalProductsPurchased());
        assertEquals("THÁNG", result.getPeriod());
        assertNotNull(result.getStartDate());
        assertNotNull(result.getEndDate());
    }

    @Test
    void getMonthlyCustomerReport_February_HandlesCorrectDays() {
        // Given
        int year = 2024; // Leap year
        int month = 2;
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(50L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(200L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getMonthlyCustomerReport(year, month);

        // Then
        assertNotNull(result);
        assertEquals(29, result.getEndDate().getDayOfMonth()); // Leap year February has 29 days
    }

    @Test
    void getMonthlyCustomerReport_December_HandlesCorrectly() {
        // Given
        int year = 2025;
        int month = 12;
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(80L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(400L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getMonthlyCustomerReport(year, month);

        // Then
        assertNotNull(result);
        assertEquals(31, result.getEndDate().getDayOfMonth());
        assertEquals(12, result.getEndDate().getMonthValue());
    }

    @Test
    void getYearlyCustomerReport_Success() {
        // Given
        int year = 2025;
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(1200L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(6000L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getYearlyCustomerReport(year);

        // Then
        assertNotNull(result);
        assertEquals(1200L, result.getCustomerCount());
        assertEquals(6000L, result.getTotalProductsPurchased());
        assertEquals("NĂM", result.getPeriod());
        assertEquals(1, result.getStartDate().getMonthValue());
        assertEquals(12, result.getEndDate().getMonthValue());
    }

    @Test
    void getYearlyCustomerReport_VerifiesDateRange() {
        // Given
        int year = 2024;
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(1000L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(5000L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getYearlyCustomerReport(year);

        // Then
        assertNotNull(result);
        assertEquals(2024, result.getStartDate().getYear());
        assertEquals(2024, result.getEndDate().getYear());
        assertEquals(1, result.getStartDate().getDayOfMonth());
        assertEquals(31, result.getEndDate().getDayOfMonth());
    }

    @Test
    void getCustomCustomerReport_Success() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(150L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(750L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getCustomCustomerReport(startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(150L, result.getCustomerCount());
        assertEquals(750L, result.getTotalProductsPurchased());
        assertEquals("TUỲ CHỈNH", result.getPeriod());
    }

    @Test
    void getCustomCustomerReport_SingleDay_Success() {
        // Given
        LocalDate date = LocalDate.of(2025, 1, 15);
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(10L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(50L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getCustomCustomerReport(date, date);

        // Then
        assertNotNull(result);
        assertEquals(10L, result.getCustomerCount());
        assertEquals("TUỲ CHỈNH", result.getPeriod());
    }

    @Test
    void getCustomCustomerReport_LongDateRange_Success() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 12, 31);
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(2500L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(12000L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        CustomerReportResponse result = customerReportService.getCustomCustomerReport(startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(2500L, result.getCustomerCount());
        assertEquals(12000L, result.getTotalProductsPurchased());
    }

    @Test
    void getDailyCustomerReport_VerifiesRepositoryCalls() {
        // Given
        LocalDate date = LocalDate.of(2025, 1, 15);
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(10L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(50L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(mockCustomerData);

        // When
        customerReportService.getDailyCustomerReport(date);

        // Then
        verify(customerRepository).countCustomersByDateRange(any(LocalDateTime.class), any(LocalDateTime.class), eq("Đã thanh toán"));
        verify(customerRepository).countTotalProductsPurchasedByNewCustomers(any(LocalDateTime.class), any(LocalDateTime.class), eq("Đã thanh toán"));
        verify(customerRepository).getCustomerPurchaseDetails(any(LocalDateTime.class), any(LocalDateTime.class), eq("Đã thanh toán"));
    }

    @Test
    void getMonthlyCustomerReport_MultipleCustomers_Success() {
        // Given
        int year = 2025;
        int month = 1;
        
        Object[] customer1 = new Object[]{UUID.randomUUID().toString(), "CUS001", "Customer 1", "0111111111", 3L, 5L};
        Object[] customer2 = new Object[]{UUID.randomUUID().toString(), "CUS002", "Customer 2", "0222222222", 2L, 3L};
        List<Object[]> multipleCustomers = Arrays.<Object[]>asList(customer1, customer2);
        
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(2L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(5L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(multipleCustomers);

        // When
        CustomerReportResponse result = customerReportService.getMonthlyCustomerReport(year, month);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getCustomerDetails().size());
        assertEquals("CUS001", result.getCustomerDetails().get(0).getCustomerCode());
        assertEquals("CUS002", result.getCustomerDetails().get(1).getCustomerCode());
    }

    @Test
    void getYearlyCustomerReport_EmptyResult_ReturnsEmptyDetails() {
        // Given
        int year = 2025;
        when(customerRepository.countCustomersByDateRange(any(), any(), anyString())).thenReturn(0L);
        when(customerRepository.countTotalProductsPurchasedByNewCustomers(any(), any(), anyString())).thenReturn(0L);
        when(customerRepository.getCustomerPurchaseDetails(any(), any(), anyString())).thenReturn(Collections.<Object[]>emptyList());

        // When
        CustomerReportResponse result = customerReportService.getYearlyCustomerReport(year);

        // Then
        assertNotNull(result);
        assertEquals(0L, result.getCustomerCount());
        assertEquals(0L, result.getTotalProductsPurchased());
        assertTrue(result.getCustomerDetails().isEmpty());
    }
}
