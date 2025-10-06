package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.PermissionCreateRequest;
import com.g127.snapbuy.dto.request.PermissionUpdateRequest;
import com.g127.snapbuy.dto.response.PermissionResponse;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PermissionService {

    PermissionResponse createPermission(PermissionCreateRequest req);

    List<PermissionResponse> getAllPermissions(Optional<Boolean> activeFilter);

    PermissionResponse getPermissionById(UUID id);

    PermissionResponse updatePermission(UUID id, PermissionUpdateRequest req);

    void deletePermission(UUID id);
}
