package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.ProductRevenueReportResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface ReportService {
    List<ProductRevenueReportResponse> getProductRevenue(LocalDateTime fromDate, LocalDateTime toDate);
}
