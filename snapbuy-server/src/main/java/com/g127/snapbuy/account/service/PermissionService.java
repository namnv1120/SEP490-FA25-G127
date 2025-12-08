package com.g127.snapbuy.account.service;

import com.g127.snapbuy.account.dto.request.PermissionCreateRequest;
import com.g127.snapbuy.account.dto.request.PermissionUpdateRequest;
import com.g127.snapbuy.account.dto.response.PermissionResponse;

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
