package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.InventoryReportFullResponse;
import com.g127.snapbuy.service.InventoryReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/inventory")
@RequiredArgsConstructor
@Slf4j
public class InventoryReportController {

    private final InventoryReportService inventoryReportService;

    /**
     * Lấy báo cáo tồn kho theo ngày
     * 
     * @param date Ngày cần xem báo cáo (format: yyyy-MM-dd)
     * @return Báo cáo tồn kho đầy đủ
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<InventoryReportFullResponse> getInventoryReport(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Received request for inventory report on date: {}", date);
        
        InventoryReportFullResponse report = inventoryReportService.getInventoryReportByDate(date);
        
        ApiResponse<InventoryReportFullResponse> response = new ApiResponse<>();
        response.setResult(report);
        
        return response;
    }
}
