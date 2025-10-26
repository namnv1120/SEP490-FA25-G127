package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.RevenueResponse;

import java.time.LocalDate;

public interface RevenueService {

    RevenueResponse getDailyRevenue(LocalDate date);

    RevenueResponse getMonthlyRevenue(int year, int month);

    RevenueResponse getYearlyRevenue(int year);

    RevenueResponse getCustomRevenue(LocalDate startDate, LocalDate endDate);
}
