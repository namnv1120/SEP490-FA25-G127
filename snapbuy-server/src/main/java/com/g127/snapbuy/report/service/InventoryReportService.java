package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.InventoryReportFullResponse;

import java.time.LocalDate;

public interface InventoryReportService {
    /**
     * Lấy báo cáo tồn kho theo ngày
     * @param date Ngày cần xem báo cáo (YYYY-MM-DD)
     * @return Báo cáo tồn kho đầy đủ bao gồm overview và chi tiết
     */
    InventoryReportFullResponse getInventoryReportByDate(LocalDate date);
}
