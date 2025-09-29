package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class RolePermissionUpdateRequest {
    @NotNull
    @Size(min = 0)
    private List<UUID> permissionIds;
}
