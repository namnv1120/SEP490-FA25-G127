package com.g127.snapbuy.settings.service;

import com.g127.snapbuy.settings.dto.request.PosSettingsUpdateRequest;
import com.g127.snapbuy.settings.dto.response.PosSettingsResponse;

public interface PosSettingsService {
    PosSettingsResponse getSettings();
    PosSettingsResponse updateSettings(PosSettingsUpdateRequest request);
}

