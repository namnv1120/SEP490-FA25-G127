package com.g127.snapbuy.settings.controller;

import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.settings.dto.request.PosSettingsUpdateRequest;
import com.g127.snapbuy.settings.dto.response.PosSettingsResponse;
import com.g127.snapbuy.settings.service.PosSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pos-settings")
@RequiredArgsConstructor
public class PosSettingsController {

    private final PosSettingsService posSettingsService;

    @GetMapping
    public ApiResponse<PosSettingsResponse> getSettings() {
        ApiResponse<PosSettingsResponse> response = new ApiResponse<>();
        response.setResult(posSettingsService.getSettings());
        response.setMessage("Lấy cài đặt POS thành công.");
        return response;
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('Quản trị viên', 'Chủ cửa hàng')")
    public ApiResponse<PosSettingsResponse> updateSettings(@Valid @RequestBody PosSettingsUpdateRequest request) {
        ApiResponse<PosSettingsResponse> response = new ApiResponse<>();
        response.setResult(posSettingsService.updateSettings(request));
        response.setMessage("Cập nhật cài đặt POS thành công.");
        return response;
    }
}

