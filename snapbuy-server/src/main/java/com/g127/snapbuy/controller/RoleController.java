package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.RoleCreateRequest;
import com.g127.snapbuy.dto.request.RolePermissionUpdateRequest;
import com.g127.snapbuy.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.dto.response.PermissionResponse;
import com.g127.snapbuy.dto.response.RoleResponse;
import com.g127.snapbuy.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @PostMapping
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<RoleResponse> createRole(@Valid @RequestBody RoleCreateRequest req) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.createRole(req));
        response.setMessage("Tạo vai trò thành công");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<RoleResponse>> list(@RequestParam(name = "active", required = false) String active) {
        Optional<Boolean> filter;
        if (active == null) {
            filter = Optional.empty();
        } else if ("all".equalsIgnoreCase(active)) {
            filter = Optional.ofNullable(null);
        } else {
            boolean activeBool = Boolean.parseBoolean(active);
            filter = Optional.of(activeBool);
        }
        ApiResponse<List<RoleResponse>> response = new ApiResponse<>();
        List<RoleResponse> roles = roleService.getAllRoles(filter);
        response.setResult(roles);
        return response;
    }

    @GetMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<RoleResponse> get(@PathVariable UUID roleId) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.getRoleById(roleId));
        return response;
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<RoleResponse> update(@PathVariable UUID roleId,
                                            @Valid @RequestBody RoleUpdateRequest req) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.updateRole(roleId, req));
        response.setMessage("Cập nhật vai trò thành công");
        return response;
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<Void> delete(@PathVariable UUID roleId) {
        roleService.deleteRole(roleId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Xóa vai trò thành công");
        return response;
    }

    @GetMapping("/{roleId}/permissions")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<PermissionResponse>> listPermissions(@PathVariable UUID roleId) {
        ApiResponse<List<PermissionResponse>> response = new ApiResponse<>();
        response.setResult(roleService.listPermissions(roleId));
        return response;
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<Void> addPermission(@PathVariable UUID roleId,
                                           @PathVariable UUID permissionId) {
        roleService.addPermission(roleId, permissionId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Thêm quyền vào vai trò thành công");
        return response;
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<Void> removePermission(@PathVariable UUID roleId,
                                              @PathVariable UUID permissionId) {
        roleService.removePermission(roleId, permissionId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Xóa quyền khỏi vai trò thành công");
        return response;
    }

    @PutMapping("/{roleId}/permissions")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<RoleResponse> setPermissions(@PathVariable UUID roleId,
                                                    @Valid @RequestBody RolePermissionUpdateRequest req) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.setPermissions(roleId, req));
        response.setMessage("Cập nhật quyền cho vai trò thành công");
        return response;
    }

    @PatchMapping("/{roleId}/toggle-status")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<RoleResponse> toggleRoleStatus(@PathVariable UUID roleId) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.toggleRoleStatus(roleId));
        response.setMessage("Đã cập nhật trạng thái vai trò thành công");
        return response;
    }
}
