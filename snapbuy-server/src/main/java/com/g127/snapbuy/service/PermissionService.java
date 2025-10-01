package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.PermissionCreateRequest;
import com.g127.snapbuy.dto.request.PermissionUpdateRequest;
import com.g127.snapbuy.dto.response.PermissionResponse;

import java.util.List;
import java.util.UUID;

public interface PermissionService {
    PermissionResponse createPermission(PermissionCreateRequest req);
    List<PermissionResponse> getAllPermissions();
    PermissionResponse getPermissionById(UUID permissionId);
    PermissionResponse updatePermission(UUID permissionId, PermissionUpdateRequest req);
    void deletePermission(UUID permissionId);
}
