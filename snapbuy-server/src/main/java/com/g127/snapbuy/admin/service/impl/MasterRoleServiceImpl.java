package com.g127.snapbuy.admin.service.impl;

import com.g127.snapbuy.account.entity.Role;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.account.repository.RoleRepository;
import com.g127.snapbuy.admin.dto.request.MasterRoleRequest;
import com.g127.snapbuy.admin.dto.response.MasterRoleResponse;
import com.g127.snapbuy.admin.entity.MasterRole;
import com.g127.snapbuy.admin.repository.MasterRoleRepository;
import com.g127.snapbuy.admin.service.MasterRoleService;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.tenant.context.TenantContext;
import com.g127.snapbuy.tenant.entity.Tenant;
import com.g127.snapbuy.tenant.repository.TenantOwnerRepository;
import com.g127.snapbuy.tenant.repository.TenantRepository;
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
    private final TenantRepository tenantRepository;
    private final AccountRepository accountRepository;
    private final TenantOwnerRepository tenantOwnerRepository;
    private final com.g127.snapbuy.admin.repository.AdminAccountRepository adminAccountRepository;

    @Override
    public List<MasterRoleResponse> getAllRoles() {
        return masterRoleRepository.findAllByOrderByDisplayOrder().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MasterRoleResponse createRole(MasterRoleRequest request) {
        // Kiểm tra trùng lặp
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

        // Kiểm tra tên trùng lặp (nếu đổi tên)
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
            // Thiết lập tenant context
            TenantContext.setCurrentTenant(tenantId);
            
            // Lấy tất cả master roles (trừ Admin)
            List<MasterRole> masterRoles = masterRoleRepository.findAllByOrderByDisplayOrder().stream()
                    .filter(r -> !"Quản trị viên".equalsIgnoreCase(r.getRoleName()))
                    .toList();

            // Sync vào tenant database
            for (MasterRole masterRole : masterRoles) {
                // Kiểm tra xem role đã tồn tại chưa
                if (!roleRepository.existsByRoleNameIgnoreCase(masterRole.getRoleName())) {
                    Role tenantRole = new Role();
                    tenantRole.setRoleName(masterRole.getRoleName());
                    tenantRole.setDescription(masterRole.getDescription());
                    tenantRole.setActive(masterRole.getActive());
                    tenantRole.setCreatedDate(new Date());
                    
                    roleRepository.save(tenantRole);
                }
            }
            
        } finally {
            TenantContext.clear();
        }
    }

    private MasterRoleResponse toResponse(MasterRole role) {
        int userCount = countUsersWithRole(role.getRoleName());
        
        return MasterRoleResponse.builder()
                .roleId(role.getRoleId())
                .roleName(role.getRoleName())
                .description(role.getDescription())
                .active(role.getActive())
                .createdDate(role.getCreatedDate())
                .isSystemRole(role.getIsSystemRole())
                .displayOrder(role.getDisplayOrder())
                .userCount(userCount)
                .build();
    }

    /**
     * Đếm tổng số users có role này từ tất cả tenants
     */
    private int countUsersWithRole(String roleName) {
        try {
            // Nếu là role "Quản trị viên", đếm từ AdminAccount trong master DB
            if ("Quản trị viên".equalsIgnoreCase(roleName)) {
                TenantContext.setCurrentTenant(null);
                long count = adminAccountRepository.count();
                return (int) count;
            }
            
            // Nếu là role "Chủ cửa hàng", đếm từ TenantOwner trong master DB
            if ("Chủ cửa hàng".equalsIgnoreCase(roleName)) {
                TenantContext.setCurrentTenant(null);
                long count = tenantOwnerRepository.count();
                return (int) count;
            }
            
            // Lưu tenant context hiện tại
            String currentTenant = TenantContext.getCurrentTenant();
            
            // Switch về master DB để lấy danh sách tenants
            TenantContext.setCurrentTenant(null);
            List<Tenant> tenants = tenantRepository.findAll();
            
            int totalCount = 0;
            
            // Đếm users trong từng tenant (chỉ tenants đang active)
            for (Tenant tenant : tenants) {
                // Skip nếu tenant không active
                if (Boolean.FALSE.equals(tenant.getIsActive())) {
                    continue;
                }
                
                try {
                    TenantContext.setCurrentTenant(tenant.getTenantId().toString());
                    long count = accountRepository.countByRoles_RoleName(roleName);
                    totalCount += count;
                } catch (Exception e) {
                    log.warn("Error counting users for role {} in tenant {}: {}", 
                            roleName, tenant.getTenantCode(), e.getMessage());
                }
            }
            
            // Restore tenant context
            TenantContext.setCurrentTenant(currentTenant);
            
            return totalCount;
        } catch (Exception e) {
            log.error("Error counting users for role {}: {}", roleName, e.getMessage());
            return 0;
        }
    }
}
