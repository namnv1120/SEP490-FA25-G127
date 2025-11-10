package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.ProductReportResponse;

import java.time.LocalDate;

public interface ProductReportService {
    ProductReportResponse getDailyProductReport(LocalDate date);
    ProductReportResponse getMonthlyProductReport(int year, int month);
    ProductReportResponse getYearlyProductReport(int year);
    ProductReportResponse getCustomProductReport(LocalDate startDate, LocalDate endDate);
}

