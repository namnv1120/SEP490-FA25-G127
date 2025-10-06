package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleUpdateRequest {
    @Size(max = 50, message = "roleName must be <= 50 chars")
    private String roleName;

    @Size(max = 4000)
    private String description;

    private Boolean isActive;
}
