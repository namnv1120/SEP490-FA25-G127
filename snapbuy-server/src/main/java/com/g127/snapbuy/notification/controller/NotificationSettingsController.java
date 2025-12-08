package com.g127.snapbuy.notification.controller;

import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.notification.dto.request.NotificationSettingsUpdateRequest;
import com.g127.snapbuy.notification.dto.response.NotificationSettingsResponse;
import com.g127.snapbuy.notification.service.NotificationSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification-settings")
@RequiredArgsConstructor
public class NotificationSettingsController {

    private final NotificationSettingsService notificationSettingsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho','Nhân viên bán hàng')")
    public ApiResponse<NotificationSettingsResponse> getSettings() {
        ApiResponse<NotificationSettingsResponse> response = new ApiResponse<>();
        response.setResult(notificationSettingsService.getSettings());
        response.setMessage("Lấy cài đặt thông báo thành công.");
        return response;
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho','Nhân viên bán hàng')")
    public ApiResponse<NotificationSettingsResponse> updateSettings(@Valid @RequestBody NotificationSettingsUpdateRequest request) {
        ApiResponse<NotificationSettingsResponse> response = new ApiResponse<>();
        response.setResult(notificationSettingsService.updateSettings(request));
        response.setMessage("Cập nhật cài đặt thông báo thành công.");
        return response;
    }
}



