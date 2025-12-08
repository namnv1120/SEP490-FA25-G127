package com.g127.snapbuy.notification.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettingsUpdateRequest {
    
    private Boolean lowStockEnabled;
    
    private Boolean promotionEnabled;
    
    private Boolean purchaseOrderEnabled;
}



