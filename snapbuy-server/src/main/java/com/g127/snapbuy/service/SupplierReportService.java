package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.SupplierReportResponse;

import java.time.LocalDate;

public interface SupplierReportService {
    SupplierReportResponse getDailySupplierReport(LocalDate date);
    SupplierReportResponse getMonthlySupplierReport(int year, int month);
    SupplierReportResponse getYearlySupplierReport(int year);
    SupplierReportResponse getCustomSupplierReport(LocalDate startDate, LocalDate endDate);
}

