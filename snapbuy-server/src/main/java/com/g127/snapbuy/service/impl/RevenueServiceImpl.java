package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.response.RevenueResponse;
import com.g127.snapbuy.repository.OrderRepository;
import com.g127.snapbuy.service.RevenueService;
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

    private static final String PAID_VN = "Đã thanh toán";

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getDailyRevenue(LocalDate date) {
        log.info("Lấy doanh thu theo ngày: {}", date);

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndPaymentStatus(
                startOfDay, endOfDay, PAID_VN);
        Long orderCount = orderRepository.countOrdersByDateRangeAndPaymentStatus(
                startOfDay, endOfDay, PAID_VN);

        log.info("Doanh thu ngày {}: {} VND từ {} đơn", date, totalRevenue, orderCount);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .startDate(startOfDay)
                .endDate(endOfDay)
                .period("NGÀY")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getMonthlyRevenue(int year, int month) {
        log.info("Lấy doanh thu theo tháng: {}/{}", month, year);

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDateTime startOfMonth = startDate.atStartOfDay();
        LocalDateTime endOfMonth = endDate.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndPaymentStatus(
                startOfMonth, endOfMonth, PAID_VN);
        Long orderCount = orderRepository.countOrdersByDateRangeAndPaymentStatus(
                startOfMonth, endOfMonth, PAID_VN);

        log.info("Doanh thu tháng {}/{}: {} VND từ {} đơn", month, year, totalRevenue, orderCount);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .startDate(startOfMonth)
                .endDate(endOfMonth)
                .period("THÁNG")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getYearlyRevenue(int year) {
        log.info("Lấy doanh thu theo năm: {}", year);

        LocalDateTime startOfYear = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime endOfYear = LocalDate.of(year, 12, 31).atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndPaymentStatus(
                startOfYear, endOfYear, PAID_VN);
        Long orderCount = orderRepository.countOrdersByDateRangeAndPaymentStatus(
                startOfYear, endOfYear, PAID_VN);

        log.info("Doanh thu năm {}: {} VND từ {} đơn", year, totalRevenue, orderCount);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .startDate(startOfYear)
                .endDate(endOfYear)
                .period("NĂM")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueResponse getCustomRevenue(LocalDate startDate, LocalDate endDate) {
        log.info("Lấy doanh thu tùy chọn từ {} đến {}", startDate, endDate);

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRangeAndPaymentStatus(
                start, end, PAID_VN);
        Long orderCount = orderRepository.countOrdersByDateRangeAndPaymentStatus(
                start, end, PAID_VN);

        log.info("Doanh thu từ {} đến {}: {} VND từ {} đơn",
                startDate, endDate, totalRevenue, orderCount);

        return RevenueResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .orderCount(orderCount != null ? orderCount : 0L)
                .startDate(start)
                .endDate(end)
                .period("TÙY_CHỌN")
                .build();
    }
}
