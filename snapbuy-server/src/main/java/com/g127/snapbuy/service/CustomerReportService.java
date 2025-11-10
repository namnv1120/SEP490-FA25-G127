package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.CustomerReportResponse;

import java.time.LocalDate;

public interface CustomerReportService {
    CustomerReportResponse getDailyCustomerReport(LocalDate date);
    CustomerReportResponse getMonthlyCustomerReport(int year, int month);
    CustomerReportResponse getYearlyCustomerReport(int year);
    CustomerReportResponse getCustomCustomerReport(LocalDate startDate, LocalDate endDate);
}

