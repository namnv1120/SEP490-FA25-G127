package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.response.ProductRevenueReportResponse;
import com.g127.snapbuy.repository.OrderDetailRepository;
import com.g127.snapbuy.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<ProductRevenueReportResponse> getProductRevenue(LocalDateTime fromDate, LocalDateTime toDate, UUID accountId) {
        List<Object[]> rows = orderDetailRepository.getProductRevenueReport(fromDate, toDate, accountId);
        List<ProductRevenueReportResponse> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(ProductRevenueReportResponse.builder()
                    .productId(row[0] != null ? UUID.fromString(row[0].toString()) : null)
                    .productName((String) row[1])
                    .totalSold(row[2] != null ? ((Number) row[2]).intValue() : 0)
                    .totalRevenue(row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO)
                    .categoryId(row[4] != null ? UUID.fromString(row[4].toString()) : null)
                    .categoryName((String) row[5])
                    .supplierId(row[6] != null ? UUID.fromString(row[6].toString()) : null)
                    .supplierName((String) row[7])
                    .build());
        }
        return result;
    }

    @Override
    public List<ProductRevenueReportResponse> getProductRevenueFlexible(
            LocalDateTime from, LocalDateTime to,
            UUID productId, UUID categoryId, UUID supplierId,
            BigDecimal minRevenue, Integer limit,
            String sortBy, String sortDir
    ) {
        int safeLimit = (limit == null || limit <= 0) ? 50 : limit;
        String sb = (sortBy == null || (!sortBy.equals("sold") && !sortBy.equals("revenue"))) ? "revenue" : sortBy;
        String sd = (sortDir == null || (!sortDir.equalsIgnoreCase("asc") && !sortDir.equalsIgnoreCase("desc"))) ? "desc" : sortDir.toLowerCase();

        List<Object[]> rows = orderDetailRepository.reportProductRevenueFlexible(
                from, to, productId, categoryId, supplierId, minRevenue, safeLimit, sb, sd
        );

        List<ProductRevenueReportResponse> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(ProductRevenueReportResponse.builder()
                    .productId(r[0] != null ? UUID.fromString(r[0].toString()) : null)
                    .productName((String) r[1])
                    .totalSold(r[2] != null ? ((Number) r[2]).intValue() : 0)
                    .totalRevenue(r[3] != null ? (BigDecimal) r[3] : BigDecimal.ZERO)
                    .categoryId(r[4] != null ? UUID.fromString(r[4].toString()) : null)
                    .categoryName((String) r[5])
                    .supplierId(r[6] != null ? UUID.fromString(r[6].toString()) : null)
                    .supplierName((String) r[7])
                    .build());
        }
        return result;
    }
}
