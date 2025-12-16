package com.g127.snapbuy.admin.service;

import com.g127.snapbuy.admin.dto.request.MasterRoleRequest;
import com.g127.snapbuy.admin.dto.response.MasterRoleResponse;

import java.util.List;
import java.util.UUID;

public interface MasterRoleService {
    
    /**
     * Admin: Lấy tất cả roles
     */
    List<MasterRoleResponse> getAllRoles();
    
    /**
     * Admin: Tạo role mới
     */
    MasterRoleResponse createRole(MasterRoleRequest request);
    
    /**
     * Admin: Cập nhật role
     */
    MasterRoleResponse updateRole(UUID roleId, MasterRoleRequest request);
    
    /**
     * Admin: Xóa role (không được xóa system roles)
     */
    void deleteRole(UUID roleId);
    
    /**
     * Admin: Lấy role theo ID
     */
    MasterRoleResponse getRoleById(UUID roleId);
    
    /**
     * Tenant: Lấy roles cho tenant (không bao gồm Admin và Chủ cửa hàng)
     * Dùng để gán role cho nhân viên
     */
    List<MasterRoleResponse> getRolesForTenant();
    
    /**
     * Sync roles từ master vào tenant database khi tạo tenant mới
     */
    void syncRolesToTenant(String tenantId);
}
