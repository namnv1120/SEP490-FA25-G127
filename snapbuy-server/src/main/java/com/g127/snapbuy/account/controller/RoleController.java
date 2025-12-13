package com.g127.snapbuy.account.controller;

import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.account.dto.request.RoleCreateRequest;
import com.g127.snapbuy.account.dto.request.RolePermissionUpdateRequest;
import com.g127.snapbuy.account.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.account.dto.response.PermissionResponse;
import com.g127.snapbuy.account.dto.response.RoleResponse;
import com.g127.snapbuy.account.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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

    /**
     * Map API sort field to the actual database column used in native queries.
     * This prevents "Invalid column name" errors and avoids SQL injection via sortBy.
     */
    private String resolveRoleSortColumn(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) {
            return "role_name";
        }
        return switch (sortBy) {
            case "roleName" -> "role_name";
            case "description" -> "description";
            case "active" -> "active";
            default -> "role_name";
        };
    }

    @PostMapping
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<RoleResponse> createRole(@Valid @RequestBody RoleCreateRequest req) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.createRole(req));
        response.setMessage("Tạo vai trò thành công");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasRole('Chủ cửa hàng')")
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
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<RoleResponse> get(@PathVariable UUID roleId) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.getRoleById(roleId));
        return response;
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<RoleResponse> update(@PathVariable UUID roleId,
                                            @Valid @RequestBody RoleUpdateRequest req) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.updateRole(roleId, req));
        response.setMessage("Cập nhật vai trò thành công");
        return response;
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<Void> delete(@PathVariable UUID roleId) {
        roleService.deleteRole(roleId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Xóa vai trò thành công");
        return response;
    }

    @GetMapping("/{roleId}/permissions")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<List<PermissionResponse>> listPermissions(@PathVariable UUID roleId) {
        ApiResponse<List<PermissionResponse>> response = new ApiResponse<>();
        response.setResult(roleService.listPermissions(roleId));
        return response;
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<Void> addPermission(@PathVariable UUID roleId,
                                           @PathVariable UUID permissionId) {
        roleService.addPermission(roleId, permissionId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Thêm quyền vào vai trò thành công");
        return response;
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<Void> removePermission(@PathVariable UUID roleId,
                                              @PathVariable UUID permissionId) {
        roleService.removePermission(roleId, permissionId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Xóa quyền khỏi vai trò thành công");
        return response;
    }

    @PutMapping("/{roleId}/permissions")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<RoleResponse> setPermissions(@PathVariable UUID roleId,
                                                    @Valid @RequestBody RolePermissionUpdateRequest req) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.setPermissions(roleId, req));
        response.setMessage("Cập nhật quyền cho vai trò thành công");
        return response;
    }

    @PatchMapping("/{roleId}/toggle-status")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<RoleResponse> toggleRoleStatus(@PathVariable UUID roleId) {
        ApiResponse<RoleResponse> response = new ApiResponse<>();
        response.setResult(roleService.toggleRoleStatus(roleId));
        response.setMessage("Đã cập nhật trạng thái vai trò thành công");
        return response;
    }

    @GetMapping("/search-paged")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<PageResponse<RoleResponse>> searchRolesPaged(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roleName") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        String sortColumn = resolveRoleSortColumn(sortBy);
        var direction = "DESC".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        var pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 200),
                Sort.by(direction, sortColumn)
        );
        ApiResponse<PageResponse<RoleResponse>> response = new ApiResponse<>();
        response.setResult(roleService.searchRolesPaged(keyword, active, pageable));
        response.setMessage("Tìm kiếm vai trò (phân trang) thành công.");
        return response;
    }
}
