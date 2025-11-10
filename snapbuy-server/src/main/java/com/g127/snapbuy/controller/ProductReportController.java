package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.ProductReportResponse;
import com.g127.snapbuy.service.ProductReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/products")
@RequiredArgsConstructor
public class ProductReportController {

    private final ProductReportService productReportService;

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<ProductReportResponse> getDailyProductReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ApiResponse<ProductReportResponse> response = new ApiResponse<>();
        response.setResult(productReportService.getDailyProductReport(date));
        response.setMessage("Lấy báo cáo sản phẩm theo ngày thành công.");
        return response;
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<ProductReportResponse> getMonthlyProductReport(
            @RequestParam int year,
            @RequestParam int month) {
        ApiResponse<ProductReportResponse> response = new ApiResponse<>();
        response.setResult(productReportService.getMonthlyProductReport(year, month));
        response.setMessage("Lấy báo cáo sản phẩm theo tháng thành công.");
        return response;
    }

    @GetMapping("/yearly")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<ProductReportResponse> getYearlyProductReport(@RequestParam int year) {
        ApiResponse<ProductReportResponse> response = new ApiResponse<>();
        response.setResult(productReportService.getYearlyProductReport(year));
        response.setMessage("Lấy báo cáo sản phẩm theo năm thành công.");
        return response;
    }

    @GetMapping("/custom")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<ProductReportResponse> getCustomProductReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<ProductReportResponse> response = new ApiResponse<>();
        response.setResult(productReportService.getCustomProductReport(startDate, endDate));
        response.setMessage("Lấy báo cáo sản phẩm theo khoảng thời gian thành công.");
        return response;
    }
}

