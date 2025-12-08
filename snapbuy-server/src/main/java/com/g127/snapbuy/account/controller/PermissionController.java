package com.g127.snapbuy.account.controller;

import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.account.dto.request.PermissionCreateRequest;
import com.g127.snapbuy.account.dto.request.PermissionUpdateRequest;
import com.g127.snapbuy.account.dto.response.PermissionResponse;
import com.g127.snapbuy.account.service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<PermissionResponse> create(@Valid @RequestBody PermissionCreateRequest req) {
        ApiResponse<PermissionResponse> response = new ApiResponse<>();
        response.setResult(permissionService.createPermission(req));
        response.setMessage("Tạo quyền thành công");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<PermissionResponse>> list(@RequestParam(name = "active", required = false) String active) {
        Optional<Boolean> filter;
        if (active == null) filter = Optional.empty();
        else if ("all".equalsIgnoreCase(active)) filter = Optional.ofNullable(null);
        else filter = Optional.of(Boolean.parseBoolean(active));

        ApiResponse<List<PermissionResponse>> response = new ApiResponse<>();
        response.setResult(permissionService.getAllPermissions(filter));
        return response;
    }

    @GetMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PermissionResponse> get(@PathVariable UUID permissionId) {
        ApiResponse<PermissionResponse> response = new ApiResponse<>();
        response.setResult(permissionService.getPermissionById(permissionId));
        return response;
    }

    @PutMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PermissionResponse> update(@PathVariable UUID permissionId,
                                                  @Valid @RequestBody PermissionUpdateRequest req) {
        ApiResponse<PermissionResponse> response = new ApiResponse<>();
        response.setResult(permissionService.updatePermission(permissionId, req));
        response.setMessage("Cập nhật quyền thành công");
        return response;
    }

    @DeleteMapping("/{permissionId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<Void> delete(@PathVariable UUID permissionId) {
        permissionService.deletePermission(permissionId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Xóa quyền thành công");
        return response;
    }
}
