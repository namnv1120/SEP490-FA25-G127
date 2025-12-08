package com.g127.snapbuy.report.service;

import com.g127.snapbuy.report.dto.response.ProductReportResponse;

import java.time.LocalDate;

public interface ProductReportService {
    ProductReportResponse getDailyProductReport(LocalDate date);
    ProductReportResponse getMonthlyProductReport(int year, int month);
    ProductReportResponse getYearlyProductReport(int year);
    ProductReportResponse getCustomProductReport(LocalDate startDate, LocalDate endDate);
}

