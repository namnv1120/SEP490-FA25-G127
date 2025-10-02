package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.RoleCreateRequest;
import com.g127.snapbuy.dto.request.RolePermissionUpdateRequest;
import com.g127.snapbuy.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.dto.response.PermissionResponse;
import com.g127.snapbuy.dto.response.RoleResponse;
import com.g127.snapbuy.entity.Permission;
import com.g127.snapbuy.entity.Role;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.PermissionRepository;
import com.g127.snapbuy.repository.RoleRepository;
import com.g127.snapbuy.service.RoleService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AccountRepository accountRepository;

    private static final String ADMIN = "Admin";

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if ("ROLE_Admin".equals(ga.getAuthority())) return true;
        }
        return false;
    }

    private void ensureNotAdmin(Role r, String msg) {
        if (r.getRoleName() != null && ADMIN.equalsIgnoreCase(r.getRoleName())) {
            throw new IllegalArgumentException(msg);
        }
    }

    private void ensureActive(Role r) {
        if (r.getIsActive() != null && !r.getIsActive()) {
            throw new IllegalStateException("Role is inactive");
        }
    }

    private void ensureActive(Permission p) {
        if (p.getIsActive() != null && !p.getIsActive()) {
            throw new IllegalStateException("Permission is inactive");
        }
    }

    private RoleResponse toResponse(Role r) {
        return RoleResponse.builder()
                .id(r.getRoleId() != null ? r.getRoleId().toString() : null)
                .roleName(r.getRoleName())
                .description(r.getDescription())
                .isActive(Boolean.TRUE.equals(r.getIsActive()))
                .createdDate(r.getCreatedDate() == null ? null :
                        r.getCreatedDate().toInstant().atOffset(ZoneOffset.UTC).toString())
                .permissions(
                        r.getPermissions() == null ? List.of()
                                : r.getPermissions().stream().map(p -> PermissionResponse.builder()
                                        .id(p.getPermissionId().toString())
                                        .name(p.getPermissionName())
                                        .description(p.getDescription())
                                        .module(p.getModule())
                                        .active(Boolean.TRUE.equals(p.getIsActive()))
                                        .build())
                                .toList()
                )
                .build();
    }


    @Override
    @Transactional
    public RoleResponse createRole(RoleCreateRequest req) {
        String name = req.getRoleName().trim();
        if (ADMIN.equalsIgnoreCase(name)) {
            throw new IllegalArgumentException("Cannot create 'Admin' role");
        }
        if (roleRepository.existsByRoleNameIgnoreCase(name)) {
            throw new AppException(ErrorCode.NAME_EXISTED);
        }
        Role r = new Role();
        r.setRoleName(name);
        r.setDescription(req.getDescription());
        r.setIsActive(req.getIsActive() == null ? Boolean.TRUE : req.getIsActive());
        r.setCreatedDate(new Date());
        r.setPermissions(new HashSet<>());
        return toResponse(roleRepository.save(r));
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public RoleResponse getRoleById(UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        return toResponse(r);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(UUID roleId, RoleUpdateRequest req) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdmin(r, "Cannot update 'Admin' role");

        boolean admin = isAdmin();

        if (req.getRoleName() != null) {
            if (!admin) throw new IllegalArgumentException("Only Admin can rename role");
            String newName = req.getRoleName().trim();
            if (ADMIN.equalsIgnoreCase(newName))
                throw new IllegalArgumentException("Cannot rename to 'Admin'");
            roleRepository.findByRoleNameIgnoreCase(newName)
                    .filter(other -> !other.getRoleId().equals(roleId))
                    .ifPresent(other -> {
                        throw new AppException(ErrorCode.NAME_EXISTED);
                    });
            r.setRoleName(newName);
        }

        if (req.getDescription() != null) {
            if (!admin) throw new IllegalArgumentException("Only Admin can update description");
            r.setDescription(req.getDescription());
        }

        if (req.getIsActive() != null) {
            r.setIsActive(req.getIsActive());
        }

        return toResponse(roleRepository.save(r));
    }

    private boolean currentUserHasRole(Role role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || role == null || role.getRoleName() == null) return false;

        String marker = "ROLE_" + role.getRoleName();
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if (marker.equals(ga.getAuthority())) return true;
        }
        return false;
    }

    @Override
    @Transactional
    public void deleteRole(UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));

        ensureNotAdmin(r, "Cannot delete 'Admin' role");

        if (currentUserHasRole(r)) {
            throw new IllegalStateException("You cannot delete a role that you currently have");
        }

        long inUse = accountRepository.countAccountsByRoleId(roleId);
        if (inUse > 0) {
            throw new IllegalStateException(
                    "Role is used by " + inUse + " account(s). Unassign it before deleting.");
        }

        roleRepository.deleteById(roleId);
    }


    @Override
    public List<PermissionResponse> listPermissions(UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        return r.getPermissions().stream().map(p -> PermissionResponse.builder()
                .id(p.getPermissionId().toString())
                .name(p.getPermissionName())
                .description(p.getDescription())
                .module(p.getModule())
                .active(Boolean.TRUE.equals(p.getIsActive()))
                .build()).toList();
    }

    @Override
    @Transactional
    public void addPermission(UUID roleId, UUID permissionId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdmin(r, "Cannot modify 'Admin' role");
        ensureActive(r);

        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        ensureActive(p);

        r.getPermissions().add(p);
        roleRepository.save(r);
    }

    @Override
    @Transactional
    public void removePermission(UUID roleId, UUID permissionId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdmin(r, "Cannot modify 'Admin' role");
        ensureActive(r);

        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        ensureActive(p);

        r.getPermissions().remove(p);
        roleRepository.save(r);
    }

    @Override
    @Transactional
    public RoleResponse setPermissions(UUID roleId, RolePermissionUpdateRequest req) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdmin(r, "Cannot modify 'Admin' role");
        ensureActive(r);

        Set<Permission> newSet = new HashSet<>();
        if (req.getPermissionIds() != null) {
            for (UUID pid : new HashSet<>(req.getPermissionIds())) {
                Permission p = permissionRepository.findById(pid)
                        .orElseThrow(() -> new NoSuchElementException("Permission not found: " + pid));
                ensureActive(p);
                newSet.add(p);
            }
        }
        r.setPermissions(newSet);
        return toResponse(roleRepository.save(r));
    }
}
