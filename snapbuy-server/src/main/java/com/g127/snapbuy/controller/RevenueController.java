package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.RevenueResponse;
import com.g127.snapbuy.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/revenue")
@RequiredArgsConstructor
public class RevenueController {

    private final RevenueService revenueService;

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('Admin', 'Shop Owner')")
    public ApiResponse<RevenueResponse> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ApiResponse<RevenueResponse> response = new ApiResponse<>();
        response.setResult(revenueService.getDailyRevenue(date));
        response.setMessage("Daily revenue fetched successfully");
        return response;
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('Admin', 'Shop Owner')")
    public ApiResponse<RevenueResponse> getMonthlyRevenue(
            @RequestParam int year,
            @RequestParam int month) {
        ApiResponse<RevenueResponse> response = new ApiResponse<>();
        response.setResult(revenueService.getMonthlyRevenue(year, month));
        response.setMessage("Monthly revenue fetched successfully");
        return response;
    }

    @GetMapping("/yearly")
    @PreAuthorize("hasAnyRole('Admin', 'Shop Owner')")
    public ApiResponse<RevenueResponse> getYearlyRevenue(@RequestParam int year) {
        ApiResponse<RevenueResponse> response = new ApiResponse<>();
        response.setResult(revenueService.getYearlyRevenue(year));
        response.setMessage("Yearly revenue fetched successfully");
        return response;
    }

    @GetMapping("/custom")
    @PreAuthorize("hasAnyRole('Admin', 'Shop Owner')")
    public ApiResponse<RevenueResponse> getCustomRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ApiResponse<RevenueResponse> response = new ApiResponse<>();
        response.setResult(revenueService.getCustomRevenue(startDate, endDate));
        response.setMessage("Custom period revenue fetched successfully");
        return response;
    }
}
