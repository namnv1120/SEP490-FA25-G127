package com.g127.snapbuy.report.service;

import com.g127.snapbuy.report.dto.response.RevenueResponse;

import java.time.LocalDate;

public interface RevenueService {

    RevenueResponse getDailyRevenue(LocalDate date);

    RevenueResponse getMonthlyRevenue(int year, int month);

    RevenueResponse getYearlyRevenue(int year);

    RevenueResponse getCustomRevenue(LocalDate startDate, LocalDate endDate);
}
