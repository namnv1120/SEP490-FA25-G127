package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PermissionCreateRequest {
    @NotBlank(message = "Permission name is required")
    @Size(max = 50, message = "Permission name must be <= 50 characters")
    private String permissionName;

    @Size(max = 200)
    private String description;

    @Size(max = 50)
    private String module;

    private Boolean isActive;
}
