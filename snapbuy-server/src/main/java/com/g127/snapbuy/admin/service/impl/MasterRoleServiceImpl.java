package com.g127.snapbuy.admin.service.impl;

import com.g127.snapbuy.account.entity.Role;
import com.g127.snapbuy.account.repository.RoleRepository;
import com.g127.snapbuy.admin.dto.request.MasterRoleRequest;
import com.g127.snapbuy.admin.dto.response.MasterRoleResponse;
import com.g127.snapbuy.admin.entity.MasterRole;
import com.g127.snapbuy.admin.repository.MasterRoleRepository;
import com.g127.snapbuy.admin.service.MasterRoleService;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.tenant.context.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MasterRoleServiceImpl implements MasterRoleService {

    private final MasterRoleRepository masterRoleRepository;
    private final RoleRepository roleRepository; // Tenant DB repository

    @Override
    public List<MasterRoleResponse> getAllRoles() {
        return masterRoleRepository.findAllByOrderByDisplayOrder().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MasterRoleResponse createRole(MasterRoleRequest request) {
        // Check duplicate
        if (masterRoleRepository.existsByRoleNameIgnoreCase(request.getRoleName())) {
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }

        MasterRole role = MasterRole.builder()
                .roleName(request.getRoleName())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isSystemRole(false) // Custom roles không phải system role
                .createdDate(new Date())
                .build();

        role = masterRoleRepository.save(role);
        log.info("Created master role: {}", role.getRoleName());
        
        return toResponse(role);
    }

    @Override
    @Transactional
    public MasterRoleResponse updateRole(UUID roleId, MasterRoleRequest request) {
        MasterRole role = masterRoleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // Không được sửa system roles
        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new AppException(ErrorCode.CANNOT_MODIFY_SYSTEM_ROLE);
        }

        // Check duplicate name (nếu đổi tên)
        if (!role.getRoleName().equalsIgnoreCase(request.getRoleName())) {
            if (masterRoleRepository.existsByRoleNameIgnoreCase(request.getRoleName())) {
                throw new AppException(ErrorCode.ROLE_EXISTED);
            }
            role.setRoleName(request.getRoleName());
        }

        role.setDescription(request.getDescription());
        role.setActive(request.getActive());
        role.setDisplayOrder(request.getDisplayOrder());

        role = masterRoleRepository.save(role);
        log.info("Updated master role: {}", role.getRoleName());
        
        return toResponse(role);
    }

    @Override
    @Transactional
    public void deleteRole(UUID roleId) {
        MasterRole role = masterRoleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // Không được xóa system roles
        if (Boolean.TRUE.equals(role.getIsSystemRole())) {
            throw new AppException(ErrorCode.CANNOT_DELETE_SYSTEM_ROLE);
        }

        masterRoleRepository.delete(role);
        log.info("Deleted master role: {}", role.getRoleName());
    }

    @Override
    public MasterRoleResponse getRoleById(UUID roleId) {
        MasterRole role = masterRoleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        return toResponse(role);
    }

    @Override
    public List<MasterRoleResponse> getRolesForTenant() {
        // Tenant chỉ thấy non-system roles
        return masterRoleRepository.findByIsSystemRoleFalseAndActiveOrderByDisplayOrder(true).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void syncRolesToTenant(String tenantId) {
        try {
            // Set tenant context
            TenantContext.setCurrentTenant(tenantId);
            
            // Lấy tất cả master roles (trừ Admin)
            List<MasterRole> masterRoles = masterRoleRepository.findAllByOrderByDisplayOrder().stream()
                    .filter(r -> !"Quản trị viên".equalsIgnoreCase(r.getRoleName()))
                    .toList();

            // Sync vào tenant database
            for (MasterRole masterRole : masterRoles) {
                // Check if role already exists
                if (!roleRepository.existsByRoleNameIgnoreCase(masterRole.getRoleName())) {
                    Role tenantRole = new Role();
                    tenantRole.setRoleName(masterRole.getRoleName());
                    tenantRole.setDescription(masterRole.getDescription());
                    tenantRole.setActive(masterRole.getActive());
                    tenantRole.setCreatedDate(new Date());
                    
                    roleRepository.save(tenantRole);
                    log.info("Synced role '{}' to tenant {}", masterRole.getRoleName(), tenantId);
                }
            }
            
        } finally {
            TenantContext.clear();
        }
    }

    private MasterRoleResponse toResponse(MasterRole role) {
        return MasterRoleResponse.builder()
                .roleId(role.getRoleId())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .active(role.getActive())
                .createdDate(role.getCreatedDate())
                .isSystemRole(role.getIsSystemRole())
                .displayOrder(role.getDisplayOrder())
                .userCount(0) // TODO: Count users across all tenants
                .build();
    }
}
