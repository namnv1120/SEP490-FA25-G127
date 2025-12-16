package com.g127.snapbuy.tenant.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TenantResponse {
    private String tenantId;
    private String tenantName;
    private String tenantCode;
    private String dbName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime createdDate;
    private LocalDateTime subscriptionStart;
    private LocalDateTime subscriptionEnd;
    private Integer maxUsers;
    private Integer maxProducts;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private String storeName; // Display name for store
    private Integer userCount; // Number of users in this tenant
    private Integer productCount; // Number of products in this tenant
    private Long revenue; // Total revenue for this tenant
}
