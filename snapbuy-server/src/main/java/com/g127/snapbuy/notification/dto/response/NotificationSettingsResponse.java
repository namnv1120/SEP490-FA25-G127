package com.g127.snapbuy.notification.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettingsResponse {
    private UUID settingsId;
    private UUID accountId;
    private Boolean lowStockEnabled;
    private Boolean promotionEnabled;
    private Boolean purchaseOrderEnabled;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}



