package com.g127.snapbuy.account.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class RolePermissionUpdateRequest {
    private List<UUID> permissionIds;
}
