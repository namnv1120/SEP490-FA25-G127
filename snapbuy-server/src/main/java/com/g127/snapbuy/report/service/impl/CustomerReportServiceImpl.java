package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.report.dto.response.CustomerReportResponse;
import com.g127.snapbuy.customer.repository.CustomerRepository;
import com.g127.snapbuy.report.service.CustomerReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerReportServiceImpl implements CustomerReportService {

    private final CustomerRepository customerRepository;
    private static final String PAID_VN = "Đã thanh toán";

    @Override
    @Transactional(readOnly = true)
    public CustomerReportResponse getDailyCustomerReport(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        Long customerCount = customerRepository.countCustomersByDateRange(startOfDay, endOfDay, PAID_VN);
        Long totalProductsPurchased = customerRepository.countTotalProductsPurchasedByNewCustomers(
                startOfDay, endOfDay, PAID_VN);
        List<Object[]> customerData = customerRepository.getCustomerPurchaseDetails(
                startOfDay, endOfDay, PAID_VN);

        List<CustomerReportResponse.CustomerPurchaseDetail> customerDetails = customerData.stream()
                .map(row -> CustomerReportResponse.CustomerPurchaseDetail.builder()
                        .customerId(row[0].toString())
                        .customerCode(row[1] != null ? row[1].toString() : "N/A")
                        .customerName(row[2] != null ? row[2].toString() : "N/A")
                        .phone(row[3] != null ? row[3].toString() : "N/A")
                        .productsPurchasedCount(((Number) row[4]).longValue())
                        .totalQuantityPurchased(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        return CustomerReportResponse.builder()
                .customerCount(customerCount != null ? customerCount : 0L)
                .totalProductsPurchased(totalProductsPurchased != null ? totalProductsPurchased : 0L)
                .startDate(startOfDay)
                .endDate(endOfDay)
                .period("NGÀY")
                .customerDetails(customerDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerReportResponse getMonthlyCustomerReport(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDateTime startOfMonth = startDate.atStartOfDay();
        LocalDateTime endOfMonth = endDate.atTime(LocalTime.MAX);

        Long customerCount = customerRepository.countCustomersByDateRange(startOfMonth, endOfMonth, PAID_VN);
        Long totalProductsPurchased = customerRepository.countTotalProductsPurchasedByNewCustomers(
                startOfMonth, endOfMonth, PAID_VN);
        List<Object[]> customerData = customerRepository.getCustomerPurchaseDetails(
                startOfMonth, endOfMonth, PAID_VN);

        List<CustomerReportResponse.CustomerPurchaseDetail> customerDetails = customerData.stream()
                .map(row -> CustomerReportResponse.CustomerPurchaseDetail.builder()
                        .customerId(row[0].toString())
                        .customerCode(row[1] != null ? row[1].toString() : "N/A")
                        .customerName(row[2] != null ? row[2].toString() : "N/A")
                        .phone(row[3] != null ? row[3].toString() : "N/A")
                        .productsPurchasedCount(((Number) row[4]).longValue())
                        .totalQuantityPurchased(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        return CustomerReportResponse.builder()
                .customerCount(customerCount != null ? customerCount : 0L)
                .totalProductsPurchased(totalProductsPurchased != null ? totalProductsPurchased : 0L)
                .startDate(startOfMonth)
                .endDate(endOfMonth)
                .period("THÁNG")
                .customerDetails(customerDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerReportResponse getYearlyCustomerReport(int year) {
        LocalDateTime startOfYear = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime endOfYear = LocalDate.of(year, 12, 31).atTime(LocalTime.MAX);

        Long customerCount = customerRepository.countCustomersByDateRange(startOfYear, endOfYear, PAID_VN);
        Long totalProductsPurchased = customerRepository.countTotalProductsPurchasedByNewCustomers(
                startOfYear, endOfYear, PAID_VN);
        List<Object[]> customerData = customerRepository.getCustomerPurchaseDetails(
                startOfYear, endOfYear, PAID_VN);

        List<CustomerReportResponse.CustomerPurchaseDetail> customerDetails = customerData.stream()
                .map(row -> CustomerReportResponse.CustomerPurchaseDetail.builder()
                        .customerId(row[0].toString())
                        .customerCode(row[1] != null ? row[1].toString() : "N/A")
                        .customerName(row[2] != null ? row[2].toString() : "N/A")
                        .phone(row[3] != null ? row[3].toString() : "N/A")
                        .productsPurchasedCount(((Number) row[4]).longValue())
                        .totalQuantityPurchased(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        return CustomerReportResponse.builder()
                .customerCount(customerCount != null ? customerCount : 0L)
                .totalProductsPurchased(totalProductsPurchased != null ? totalProductsPurchased : 0L)
                .startDate(startOfYear)
                .endDate(endOfYear)
                .period("NĂM")
                .customerDetails(customerDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerReportResponse getCustomCustomerReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Long customerCount = customerRepository.countCustomersByDateRange(start, end, PAID_VN);
        Long totalProductsPurchased = customerRepository.countTotalProductsPurchasedByNewCustomers(
                start, end, PAID_VN);
        List<Object[]> customerData = customerRepository.getCustomerPurchaseDetails(
                start, end, PAID_VN);

        List<CustomerReportResponse.CustomerPurchaseDetail> customerDetails = customerData.stream()
                .map(row -> CustomerReportResponse.CustomerPurchaseDetail.builder()
                        .customerId(row[0].toString())
                        .customerCode(row[1] != null ? row[1].toString() : "N/A")
                        .customerName(row[2] != null ? row[2].toString() : "N/A")
                        .phone(row[3] != null ? row[3].toString() : "N/A")
                        .productsPurchasedCount(((Number) row[4]).longValue())
                        .totalQuantityPurchased(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                        .build())
                .collect(Collectors.toList());

        return CustomerReportResponse.builder()
                .customerCount(customerCount != null ? customerCount : 0L)
                .totalProductsPurchased(totalProductsPurchased != null ? totalProductsPurchased : 0L)
                .startDate(start)
                .endDate(end)
                .period("TUỲ CHỈNH")
                .customerDetails(customerDetails)
                .build();
    }
}

