package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.RoleCreateRequest;
import com.g127.snapbuy.dto.request.RolePermissionUpdateRequest;
import com.g127.snapbuy.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.dto.response.PermissionResponse;
import com.g127.snapbuy.dto.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    RoleResponse createRole(RoleCreateRequest req);
    List<RoleResponse> getAllRoles();
    RoleResponse getRoleById(UUID roleId);
    RoleResponse updateRole(UUID roleId, RoleUpdateRequest req);
    void deleteRole(UUID roleId);

    List<PermissionResponse> listPermissions(UUID roleId);
    void addPermission(UUID roleId, UUID permissionId);
    void removePermission(UUID roleId, UUID permissionId);
    RoleResponse setPermissions(UUID roleId, RolePermissionUpdateRequest req);
}
