package com.g127.snapbuy.report.controller;

import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.report.dto.response.CustomerReportResponse;
import com.g127.snapbuy.report.service.CustomerReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/customers")
@RequiredArgsConstructor
public class CustomerReportController {

    private final CustomerReportService customerReportService;

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<CustomerReportResponse> getDailyCustomerReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ApiResponse<CustomerReportResponse> response = new ApiResponse<>();
        response.setResult(customerReportService.getDailyCustomerReport(date));
        response.setMessage("Lấy báo cáo khách hàng theo ngày thành công.");
        return response;
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<CustomerReportResponse> getMonthlyCustomerReport(
            @RequestParam int year,
            @RequestParam int month) {
        ApiResponse<CustomerReportResponse> response = new ApiResponse<>();
        response.setResult(customerReportService.getMonthlyCustomerReport(year, month));
        response.setMessage("Lấy báo cáo khách hàng theo tháng thành công.");
        return response;
    }

    @GetMapping("/yearly")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<CustomerReportResponse> getYearlyCustomerReport(@RequestParam int year) {
        ApiResponse<CustomerReportResponse> response = new ApiResponse<>();
        response.setResult(customerReportService.getYearlyCustomerReport(year));
        response.setMessage("Lấy báo cáo khách hàng theo năm thành công.");
        return response;
    }

    @GetMapping("/custom")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<CustomerReportResponse> getCustomCustomerReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<CustomerReportResponse> response = new ApiResponse<>();
        response.setResult(customerReportService.getCustomCustomerReport(startDate, endDate));
        response.setMessage("Lấy báo cáo khách hàng theo khoảng thời gian thành công.");
        return response;
    }
}

