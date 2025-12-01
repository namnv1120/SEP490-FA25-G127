package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.NotificationSettingsUpdateRequest;
import com.g127.snapbuy.dto.response.NotificationSettingsResponse;

import java.util.UUID;

public interface NotificationSettingsService {
    NotificationSettingsResponse getSettings();
    NotificationSettingsResponse updateSettings(NotificationSettingsUpdateRequest request);
    boolean isNotificationEnabled(String notificationCategory);
    boolean isNotificationEnabledForAccount(UUID accountId, String notificationCategory);
}

