package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.ProductRevenueReportResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReportService {
    List<ProductRevenueReportResponse> getProductRevenue(LocalDateTime fromDate, LocalDateTime toDate);

    List<ProductRevenueReportResponse> getProductRevenueFlexible(
            LocalDateTime from, LocalDateTime to,
            UUID productId, UUID categoryId, UUID supplierId,
            BigDecimal minRevenue, Integer limit,
            String sortBy, String sortDir
    );
}
