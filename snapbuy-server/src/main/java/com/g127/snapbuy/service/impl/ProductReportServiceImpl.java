package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.response.ProductReportResponse;
import com.g127.snapbuy.repository.OrderDetailRepository;
import com.g127.snapbuy.service.ProductReportService;
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
public class ProductReportServiceImpl implements ProductReportService {

    private final OrderDetailRepository orderDetailRepository;
    private static final String PAID_VN = "Đã thanh toán";

    @Override
    @Transactional(readOnly = true)
    public ProductReportResponse getDailyProductReport(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        Long totalProductsSold = orderDetailRepository.sumTotalQuantitySold(
                startOfDay, endOfDay, PAID_VN);
        Long uniqueProductsCount = orderDetailRepository.countUniqueProductsSold(
                startOfDay, endOfDay, PAID_VN);
        
        List<Object[]> productData = orderDetailRepository.getProductSalesByDateRange(
                startOfDay, endOfDay, PAID_VN);

        List<ProductReportResponse.ProductSalesDetail> productDetails = productData.stream()
                .map(row -> {
                    try {
                        return ProductReportResponse.ProductSalesDetail.builder()
                                .productId(row[0] != null ? row[0].toString() : "")
                                .productName(row[1] != null ? row[1].toString() : "")
                                .productCode(row[2] != null ? row[2].toString() : "")
                                .totalQuantitySold(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                                .categoryName(row[4] != null ? row[4].toString() : "N/A")
                                .supplierName(row[5] != null ? row[5].toString() : "N/A")
                                .unitPrice(row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO)
                                .costPrice(row[7] != null ? new BigDecimal(row[7].toString()) : BigDecimal.ZERO)
                                .build();
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(detail -> detail != null)
                .collect(Collectors.toList());


        return ProductReportResponse.builder()
                .totalProductsSold(totalProductsSold != null ? totalProductsSold : 0L)
                .uniqueProductsCount(uniqueProductsCount != null ? uniqueProductsCount : 0L)
                .startDate(startOfDay)
                .endDate(endOfDay)
                .period("NGÀY")
                .productDetails(productDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReportResponse getMonthlyProductReport(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDateTime startOfMonth = startDate.atStartOfDay();
        LocalDateTime endOfMonth = endDate.atTime(LocalTime.MAX);

        Long totalProductsSold = orderDetailRepository.sumTotalQuantitySold(
                startOfMonth, endOfMonth, PAID_VN);
        Long uniqueProductsCount = orderDetailRepository.countUniqueProductsSold(
                startOfMonth, endOfMonth, PAID_VN);
        List<Object[]> productData = orderDetailRepository.getProductSalesByDateRange(
                startOfMonth, endOfMonth, PAID_VN);

        List<ProductReportResponse.ProductSalesDetail> productDetails = productData.stream()
                .map(row -> {
                    try {
                        return ProductReportResponse.ProductSalesDetail.builder()
                                .productId(row[0] != null ? row[0].toString() : "")
                                .productName(row[1] != null ? row[1].toString() : "")
                                .productCode(row[2] != null ? row[2].toString() : "")
                                .totalQuantitySold(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                                .categoryName(row[4] != null ? row[4].toString() : "N/A")
                                .supplierName(row[5] != null ? row[5].toString() : "N/A")
                                .unitPrice(row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO)
                                .costPrice(row[7] != null ? new BigDecimal(row[7].toString()) : BigDecimal.ZERO)
                                .build();
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(detail -> detail != null)
                .collect(Collectors.toList());

        return ProductReportResponse.builder()
                .totalProductsSold(totalProductsSold != null ? totalProductsSold : 0L)
                .uniqueProductsCount(uniqueProductsCount != null ? uniqueProductsCount : 0L)
                .startDate(startOfMonth)
                .endDate(endOfMonth)
                .period("THÁNG")
                .productDetails(productDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReportResponse getYearlyProductReport(int year) {
        LocalDateTime startOfYear = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime endOfYear = LocalDate.of(year, 12, 31).atTime(LocalTime.MAX);

        Long totalProductsSold = orderDetailRepository.sumTotalQuantitySold(
                startOfYear, endOfYear, PAID_VN);
        Long uniqueProductsCount = orderDetailRepository.countUniqueProductsSold(
                startOfYear, endOfYear, PAID_VN);
        List<Object[]> productData = orderDetailRepository.getProductSalesByDateRange(
                startOfYear, endOfYear, PAID_VN);

        List<ProductReportResponse.ProductSalesDetail> productDetails = productData.stream()
                .map(row -> {
                    try {
                        return ProductReportResponse.ProductSalesDetail.builder()
                                .productId(row[0] != null ? row[0].toString() : "")
                                .productName(row[1] != null ? row[1].toString() : "")
                                .productCode(row[2] != null ? row[2].toString() : "")
                                .totalQuantitySold(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                                .categoryName(row[4] != null ? row[4].toString() : "N/A")
                                .supplierName(row[5] != null ? row[5].toString() : "N/A")
                                .unitPrice(row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO)
                                .costPrice(row[7] != null ? new BigDecimal(row[7].toString()) : BigDecimal.ZERO)
                                .build();
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(detail -> detail != null)
                .collect(Collectors.toList());

        return ProductReportResponse.builder()
                .totalProductsSold(totalProductsSold != null ? totalProductsSold : 0L)
                .uniqueProductsCount(uniqueProductsCount != null ? uniqueProductsCount : 0L)
                .startDate(startOfYear)
                .endDate(endOfYear)
                .period("NĂM")
                .productDetails(productDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReportResponse getCustomProductReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Long totalProductsSold = orderDetailRepository.sumTotalQuantitySold(
                start, end, PAID_VN);
        Long uniqueProductsCount = orderDetailRepository.countUniqueProductsSold(
                start, end, PAID_VN);
        List<Object[]> productData = orderDetailRepository.getProductSalesByDateRange(
                start, end, PAID_VN);

        List<ProductReportResponse.ProductSalesDetail> productDetails = productData.stream()
                .map(row -> {
                    try {
                        return ProductReportResponse.ProductSalesDetail.builder()
                                .productId(row[0] != null ? row[0].toString() : "")
                                .productName(row[1] != null ? row[1].toString() : "")
                                .productCode(row[2] != null ? row[2].toString() : "")
                                .totalQuantitySold(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                                .categoryName(row[4] != null ? row[4].toString() : "N/A")
                                .supplierName(row[5] != null ? row[5].toString() : "N/A")
                                .unitPrice(row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO)
                                .costPrice(row[7] != null ? new BigDecimal(row[7].toString()) : BigDecimal.ZERO)
                                .build();
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(detail -> detail != null)
                .collect(Collectors.toList());

        return ProductReportResponse.builder()
                .totalProductsSold(totalProductsSold != null ? totalProductsSold : 0L)
                .uniqueProductsCount(uniqueProductsCount != null ? uniqueProductsCount : 0L)
                .startDate(start)
                .endDate(end)
                .period("TUỲ CHỈNH")
                .productDetails(productDetails)
                .build();
    }
}

