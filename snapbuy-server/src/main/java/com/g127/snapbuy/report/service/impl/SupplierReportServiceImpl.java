package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.report.dto.response.SupplierReportResponse;
import com.g127.snapbuy.supplier.repository.SupplierRepository;
import com.g127.snapbuy.report.service.SupplierReportService;
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
public class SupplierReportServiceImpl implements SupplierReportService {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional(readOnly = true)
    public SupplierReportResponse getDailySupplierReport(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        Long supplierCount = supplierRepository.countSuppliersByDateRange(startOfDay, endOfDay);
        BigDecimal totalAmount = supplierRepository.sumTotalAmount(startOfDay, endOfDay);
        Long uniqueProductsCount = supplierRepository.countUniqueProductsReceived(startOfDay, endOfDay);
        Long totalQuantityReceived = supplierRepository.sumTotalQuantityReceived(startOfDay, endOfDay);
        List<Object[]> supplierData = supplierRepository.getSupplierProductDetails(startOfDay, endOfDay);

        List<SupplierReportResponse.SupplierProductDetail> supplierDetails = supplierData.stream()
                .map(row -> SupplierReportResponse.SupplierProductDetail.builder()
                        .supplierId(row[0].toString())
                        .supplierCode(row[1] != null ? row[1].toString() : "N/A")
                        .supplierName(row[2] != null ? row[2].toString() : "N/A")
                        .phone(row[3] != null ? row[3].toString() : "N/A")
                        .productsReceivedCount(((Number) row[4]).longValue())
                        .totalQuantityReceived(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                        .totalAmount(row[6] != null ? (BigDecimal) row[6] : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());

        return SupplierReportResponse.builder()
                .supplierCount(supplierCount != null ? supplierCount : 0L)
                .totalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO)
                .uniqueProductsCount(uniqueProductsCount != null ? uniqueProductsCount : 0L)
                .totalQuantityReceived(totalQuantityReceived != null ? totalQuantityReceived : 0L)
                .startDate(startOfDay)
                .endDate(endOfDay)
                .period("NGÀY")
                .supplierDetails(supplierDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierReportResponse getMonthlySupplierReport(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        LocalDateTime startOfMonth = startDate.atStartOfDay();
        LocalDateTime endOfMonth = endDate.atTime(LocalTime.MAX);

        Long supplierCount = supplierRepository.countSuppliersByDateRange(startOfMonth, endOfMonth);
        BigDecimal totalAmount = supplierRepository.sumTotalAmount(startOfMonth, endOfMonth);
        Long uniqueProductsCount = supplierRepository.countUniqueProductsReceived(startOfMonth, endOfMonth);
        Long totalQuantityReceived = supplierRepository.sumTotalQuantityReceived(startOfMonth, endOfMonth);
        List<Object[]> supplierData = supplierRepository.getSupplierProductDetails(startOfMonth, endOfMonth);

        List<SupplierReportResponse.SupplierProductDetail> supplierDetails = supplierData.stream()
                .map(row -> SupplierReportResponse.SupplierProductDetail.builder()
                        .supplierId(row[0].toString())
                        .supplierCode(row[1] != null ? row[1].toString() : "N/A")
                        .supplierName(row[2] != null ? row[2].toString() : "N/A")
                        .phone(row[3] != null ? row[3].toString() : "N/A")
                        .productsReceivedCount(((Number) row[4]).longValue())
                        .totalQuantityReceived(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                        .totalAmount(row[6] != null ? (BigDecimal) row[6] : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());

        return SupplierReportResponse.builder()
                .supplierCount(supplierCount != null ? supplierCount : 0L)
                .totalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO)
                .uniqueProductsCount(uniqueProductsCount != null ? uniqueProductsCount : 0L)
                .totalQuantityReceived(totalQuantityReceived != null ? totalQuantityReceived : 0L)
                .startDate(startOfMonth)
                .endDate(endOfMonth)
                .period("THÁNG")
                .supplierDetails(supplierDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierReportResponse getYearlySupplierReport(int year) {
        LocalDateTime startOfYear = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime endOfYear = LocalDate.of(year, 12, 31).atTime(LocalTime.MAX);

        Long supplierCount = supplierRepository.countSuppliersByDateRange(startOfYear, endOfYear);
        BigDecimal totalAmount = supplierRepository.sumTotalAmount(startOfYear, endOfYear);
        Long uniqueProductsCount = supplierRepository.countUniqueProductsReceived(startOfYear, endOfYear);
        Long totalQuantityReceived = supplierRepository.sumTotalQuantityReceived(startOfYear, endOfYear);
        List<Object[]> supplierData = supplierRepository.getSupplierProductDetails(startOfYear, endOfYear);

        List<SupplierReportResponse.SupplierProductDetail> supplierDetails = supplierData.stream()
                .map(row -> SupplierReportResponse.SupplierProductDetail.builder()
                        .supplierId(row[0].toString())
                        .supplierCode(row[1] != null ? row[1].toString() : "N/A")
                        .supplierName(row[2] != null ? row[2].toString() : "N/A")
                        .phone(row[3] != null ? row[3].toString() : "N/A")
                        .productsReceivedCount(((Number) row[4]).longValue())
                        .totalQuantityReceived(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                        .totalAmount(row[6] != null ? (BigDecimal) row[6] : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());

        return SupplierReportResponse.builder()
                .supplierCount(supplierCount != null ? supplierCount : 0L)
                .totalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO)
                .uniqueProductsCount(uniqueProductsCount != null ? uniqueProductsCount : 0L)
                .totalQuantityReceived(totalQuantityReceived != null ? totalQuantityReceived : 0L)
                .startDate(startOfYear)
                .endDate(endOfYear)
                .period("NĂM")
                .supplierDetails(supplierDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierReportResponse getCustomSupplierReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        Long supplierCount = supplierRepository.countSuppliersByDateRange(start, end);
        BigDecimal totalAmount = supplierRepository.sumTotalAmount(start, end);
        Long uniqueProductsCount = supplierRepository.countUniqueProductsReceived(start, end);
        Long totalQuantityReceived = supplierRepository.sumTotalQuantityReceived(start, end);
        List<Object[]> supplierData = supplierRepository.getSupplierProductDetails(start, end);

        List<SupplierReportResponse.SupplierProductDetail> supplierDetails = supplierData.stream()
                .map(row -> SupplierReportResponse.SupplierProductDetail.builder()
                        .supplierId(row[0].toString())
                        .supplierCode(row[1] != null ? row[1].toString() : "N/A")
                        .supplierName(row[2] != null ? row[2].toString() : "N/A")
                        .phone(row[3] != null ? row[3].toString() : "N/A")
                        .productsReceivedCount(((Number) row[4]).longValue())
                        .totalQuantityReceived(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                        .totalAmount(row[6] != null ? (BigDecimal) row[6] : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());

        return SupplierReportResponse.builder()
                .supplierCount(supplierCount != null ? supplierCount : 0L)
                .totalAmount(totalAmount != null ? totalAmount : BigDecimal.ZERO)
                .uniqueProductsCount(uniqueProductsCount != null ? uniqueProductsCount : 0L)
                .totalQuantityReceived(totalQuantityReceived != null ? totalQuantityReceived : 0L)
                .startDate(start)
                .endDate(end)
                .period("TUỲ CHỈNH")
                .supplierDetails(supplierDetails)
                .build();
    }
}

