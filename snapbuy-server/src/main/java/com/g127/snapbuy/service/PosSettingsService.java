package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.PosSettingsUpdateRequest;
import com.g127.snapbuy.dto.response.PosSettingsResponse;

public interface PosSettingsService {
    PosSettingsResponse getSettings();
    PosSettingsResponse updateSettings(PosSettingsUpdateRequest request);
}

