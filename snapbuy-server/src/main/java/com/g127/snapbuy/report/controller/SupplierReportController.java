package com.g127.snapbuy.report.controller;

import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.report.dto.response.SupplierReportResponse;
import com.g127.snapbuy.report.service.SupplierReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/suppliers")
@RequiredArgsConstructor
public class SupplierReportController {

    private final SupplierReportService supplierReportService;

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<SupplierReportResponse> getDailySupplierReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ApiResponse<SupplierReportResponse> response = new ApiResponse<>();
        response.setResult(supplierReportService.getDailySupplierReport(date));
        response.setMessage("Lấy báo cáo nhà cung cấp theo ngày thành công.");
        return response;
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<SupplierReportResponse> getMonthlySupplierReport(
            @RequestParam int year,
            @RequestParam int month) {
        ApiResponse<SupplierReportResponse> response = new ApiResponse<>();
        response.setResult(supplierReportService.getMonthlySupplierReport(year, month));
        response.setMessage("Lấy báo cáo nhà cung cấp theo tháng thành công.");
        return response;
    }

    @GetMapping("/yearly")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<SupplierReportResponse> getYearlySupplierReport(@RequestParam int year) {
        ApiResponse<SupplierReportResponse> response = new ApiResponse<>();
        response.setResult(supplierReportService.getYearlySupplierReport(year));
        response.setMessage("Lấy báo cáo nhà cung cấp theo năm thành công.");
        return response;
    }

    @GetMapping("/custom")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<SupplierReportResponse> getCustomSupplierReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<SupplierReportResponse> response = new ApiResponse<>();
        response.setResult(supplierReportService.getCustomSupplierReport(startDate, endDate));
        response.setMessage("Lấy báo cáo nhà cung cấp theo khoảng thời gian thành công.");
        return response;
    }
}

