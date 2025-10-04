package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PermissionCreateRequest;
import com.g127.snapbuy.dto.request.PermissionUpdateRequest;
import com.g127.snapbuy.dto.response.PermissionResponse;
import com.g127.snapbuy.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<PermissionResponse> create(@Valid @RequestBody PermissionCreateRequest req) {
        ApiResponse<PermissionResponse> response = new ApiResponse<>();
        response.setResult(permissionService.createPermission(req));
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ApiResponse<List<PermissionResponse>> list() {
        ApiResponse<List<PermissionResponse>> response = new ApiResponse<>();
        response.setResult(permissionService.getAllPermissions());
        return response;
    }

    @GetMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ApiResponse<PermissionResponse> get(@PathVariable UUID permissionId) {
        ApiResponse<PermissionResponse> response = new ApiResponse<>();
        response.setResult(permissionService.getPermissionById(permissionId));
        return response;
    }

    @PutMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ApiResponse<PermissionResponse> update(@PathVariable UUID permissionId,
                                                  @Valid @RequestBody PermissionUpdateRequest req) {
        ApiResponse<PermissionResponse> response = new ApiResponse<>();
        response.setResult(permissionService.updatePermission(permissionId, req));
        return response;
    }

    @DeleteMapping("/{permissionId}")
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<Void> delete(@PathVariable UUID permissionId) {
        permissionService.deletePermission(permissionId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Permission deleted successfully");
        return response;
    }
}
