package com.g127.snapbuy.dto.request;

import lombok.Data;

@Data
public class PermissionUpdateRequest {
    private String permissionName;
    private String description;
    private String module;
    private Boolean isActive;
}
