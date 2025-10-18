package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.RevenueResponse;
import com.g127.snapbuy.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevenueServiceImpl implements RevenueService {

    private final OrderRepository orderRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getDailyRevenue(LocalDate date) {
        log.info("Fetching daily revenue for date: {}", date);

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndPaymentStatus(
                startOfDay, endOfDay, "PAID");
        Long orderCount = orderRepository.countOrdersByDateRangeAndPaymentStatus(
                startOfDay, endOfDay, "PAID");

        log.info("Daily revenue for {}: {} VND from {} orders", date, totalRevenue, orderCount);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .startDate(startOfDay)
                .endDate(endOfDay)
                .period("DAILY")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getMonthlyRevenue(int year, int month) {
        log.info("Fetching monthly revenue for year: {}, month: {}", year, month);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDateTime startOfMonth = startDate.atStartOfDay();
        LocalDateTime endOfMonth = endDate.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndPaymentStatus(
                startOfMonth, endOfMonth, "PAID");
        Long orderCount = orderRepository.countOrdersByDateRangeAndPaymentStatus(
                startOfMonth, endOfMonth, "PAID");

        log.info("Monthly revenue for {}/{}: {} VND from {} orders", month, year, totalRevenue, orderCount);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .startDate(startOfMonth)
                .endDate(endOfMonth)
                .period("MONTHLY")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getYearlyRevenue(int year) {
        log.info("Fetching yearly revenue for year: {}", year);

        LocalDateTime startOfYear = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime endOfYear = LocalDate.of(year, 12, 31).atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndPaymentStatus(
                startOfYear, endOfYear, "PAID");
        Long orderCount = orderRepository.countOrdersByDateRangeAndPaymentStatus(
                startOfYear, endOfYear, "PAID");

        log.info("Yearly revenue for {}: {} VND from {} orders", year, totalRevenue, orderCount);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .startDate(startOfYear)
                .endDate(endOfYear)
                .period("YEARLY")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getCustomRevenue(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching custom revenue from {} to {}", startDate, endDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndPaymentStatus(
                start, end, "PAID");
        Long orderCount = orderRepository.countOrdersByDateRangeAndPaymentStatus(
                start, end, "PAID");

        log.info("Custom revenue from {} to {}: {} VND from {} orders",
                startDate, endDate, totalRevenue, orderCount);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .startDate(start)
                .endDate(end)
                .period("CUSTOM")
                .build();
    }
}
