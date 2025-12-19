package com.g127.snapbuy.report.controller;

import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.report.dto.response.DailyRevenueItem;
import com.g127.snapbuy.report.dto.response.RevenueResponse;
import com.g127.snapbuy.report.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/revenue")
@RequiredArgsConstructor
public class RevenueController {

    private final RevenueService revenueService;

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<RevenueResponse> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ApiResponse<RevenueResponse> response = new ApiResponse<>();
        response.setResult(revenueService.getDailyRevenue(date));
        response.setMessage("Lấy doanh thu theo ngày thành công.");
        return response;
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<RevenueResponse> getMonthlyRevenue(
            @RequestParam int year,
            @RequestParam int month) {
        ApiResponse<RevenueResponse> response = new ApiResponse<>();
        response.setResult(revenueService.getMonthlyRevenue(year, month));
        response.setMessage("Lấy doanh thu theo tháng thành công.");
        return response;
    }

    @GetMapping("/monthly-daily")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<DailyRevenueItem>> getMonthlyDailyRevenue(
            @RequestParam int year,
            @RequestParam int month) {
        ApiResponse<List<DailyRevenueItem>> response = new ApiResponse<>();
        response.setResult(revenueService.getMonthlyDailyRevenue(year, month));
        response.setMessage("Lấy doanh thu chi tiết theo ngày trong tháng thành công.");
        return response;
    }

    @GetMapping("/yearly")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<RevenueResponse> getYearlyRevenue(@RequestParam int year) {
        ApiResponse<RevenueResponse> response = new ApiResponse<>();
        response.setResult(revenueService.getYearlyRevenue(year));
        response.setMessage("Lấy doanh thu theo năm thành công.");
        return response;
    }

    @GetMapping("/custom")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<RevenueResponse> getCustomRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<RevenueResponse> response = new ApiResponse<>();
        response.setResult(revenueService.getCustomRevenue(startDate, endDate));
        response.setMessage("Lấy doanh thu theo khoảng thời gian thành công.");
        return response;
    }
}
