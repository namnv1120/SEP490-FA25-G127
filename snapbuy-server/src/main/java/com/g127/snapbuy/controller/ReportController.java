package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.ProductRevenueReportResponse;
import com.g127.snapbuy.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/products-revenue")
    public ApiResponse<List<ProductRevenueReportResponse>> getProductRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) UUID accountId) {

        ApiResponse<List<ProductRevenueReportResponse>> response = new ApiResponse<>();
        response.setResult(reportService.getProductRevenue(from, to, accountId));
        return response;
    }

    @GetMapping("/products-revenue/flexible")
    public ApiResponse<List<ProductRevenueReportResponse>> getProductRevenueFlexible(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) BigDecimal minRevenue,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "revenue") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir
    ) {
        ApiResponse<List<ProductRevenueReportResponse>> response = new ApiResponse<>();
        response.setResult(reportService.getProductRevenueFlexible(
                from, to, productId, categoryId, supplierId, minRevenue, limit, sortBy, sortDir
        ));
        return response;
    }
}
