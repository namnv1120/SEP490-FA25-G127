package com.g127.snapbuy.account.controller;

import com.g127.snapbuy.admin.dto.request.MasterRoleRequest;
import com.g127.snapbuy.admin.dto.response.MasterRoleResponse;
import com.g127.snapbuy.admin.service.MasterRoleService;
import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.account.dto.request.RoleCreateRequest;
import com.g127.snapbuy.account.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.account.dto.response.RoleResponse;
import com.g127.snapbuy.account.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;
    private final MasterRoleService masterRoleService;
    
    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_Quản trị viên".equalsIgnoreCase(a.getAuthority()));
    }

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
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<?> createRole(@Valid @RequestBody MasterRoleRequest req) {
        // Admin tạo master role
        MasterRoleResponse masterRole = masterRoleService.createRole(req);
        ApiResponse<MasterRoleResponse> response = new ApiResponse<>();
        response.setResult(masterRole);
        response.setMessage("Tạo vai trò thành công");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasRole('Quản trị viên') or hasRole('Chủ cửa hàng')")
    public ApiResponse<?> list() {
        if (isAdmin()) {
            // Admin xem tất cả master roles
            List<MasterRoleResponse> roles = masterRoleService.getAllRoles();
            ApiResponse<List<MasterRoleResponse>> response = new ApiResponse<>();
            response.setResult(roles);
            response.setMessage("Lấy danh sách vai trò thành công");
            return response;
        } else {
            // Tenant chỉ xem non-system roles để gán cho nhân viên
            List<MasterRoleResponse> masterRoles = masterRoleService.getRolesForTenant();
            // Convert to RoleResponse for compatibility
            List<RoleResponse> roles = masterRoles.stream()
                    .map(mr -> RoleResponse.builder()
                            .id(mr.getRoleId().toString())
                            .roleName(mr.getRoleName())
                            .description(mr.getDescription())
                            .active(mr.getActive())
                            .createdDate(mr.getCreatedDate().toString())
                            .build())
                    .collect(Collectors.toList());
            
            ApiResponse<List<RoleResponse>> response = new ApiResponse<>();
            response.setResult(roles);
            response.setMessage("Lấy danh sách vai trò thành công");
            return response;
        }
    }

    @GetMapping("/{roleId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<MasterRoleResponse> get(@PathVariable UUID roleId) {
        MasterRoleResponse role = masterRoleService.getRoleById(roleId);
        ApiResponse<MasterRoleResponse> response = new ApiResponse<>();
        response.setResult(role);
        return response;
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<MasterRoleResponse> update(@PathVariable UUID roleId,
                                            @Valid @RequestBody MasterRoleRequest req) {
        MasterRoleResponse role = masterRoleService.updateRole(roleId, req);
        ApiResponse<MasterRoleResponse> response = new ApiResponse<>();
        response.setResult(role);
        response.setMessage("Cập nhật vai trò thành công");
        return response;
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<Void> delete(@PathVariable UUID roleId) {
        masterRoleService.deleteRole(roleId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Xóa vai trò thành công");
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

    @GetMapping("/search-paged")
    @PreAuthorize("hasRole('Quản trị viên')")
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
