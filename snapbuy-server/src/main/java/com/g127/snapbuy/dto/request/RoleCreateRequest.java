package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleCreateRequest {
    @NotBlank(message = "roleName is required")
    @Size(max = 50, message = "roleName must be <= 50 chars")
    private String roleName;

    @Size(max = 4000, message = "description too long")
    private String description;

    private Boolean isActive;
}
