package com.g127.snapbuy.controller;

import com.g127.snapbuy.entity.Permission;
import com.g127.snapbuy.entity.Role;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.repository.PermissionRepository;
import com.g127.snapbuy.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    private static final String ADMIN_ROLE_NAME = "Admin";

    @PostMapping
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Role> createRole(@RequestBody Role req) {
        String name = req.getRoleName() == null ? null : req.getRoleName().trim();
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("roleName is required");
        }
        if (ADMIN_ROLE_NAME.equalsIgnoreCase(name)) {
            throw new IllegalArgumentException("Cannot create role named 'Admin'.");
        }
        if (roleRepository.existsByRoleNameIgnoreCase(name)) {
            throw new AppException(ErrorCode.NAME_EXISTED);
        }

        Role r = new Role();
        r.setRoleName(name);
        r.setDescription(req.getDescription());
        r.setIsActive(req.getIsActive() == null ? Boolean.TRUE : req.getIsActive());
        r.setCreatedDate(new Date());
        return ResponseEntity.status(HttpStatus.CREATED).body(roleRepository.save(r));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<List<Role>> list() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @GetMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Role> get(@PathVariable UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        return ResponseEntity.ok(r);
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Role> update(@PathVariable UUID roleId, @RequestBody Role req) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdminRole(r, "Cannot update 'Admin' role.");

        if (req.getRoleName() != null) {
            String newName = req.getRoleName().trim();
            if (newName.isBlank()) throw new IllegalArgumentException("roleName must not be blank");
            if (ADMIN_ROLE_NAME.equalsIgnoreCase(newName)) {
                throw new IllegalArgumentException("Cannot rename any role to 'Admin'.");
            }
            roleRepository.findByRoleNameIgnoreCase(newName)
                    .filter(other -> !other.getRoleId().equals(roleId))
                    .ifPresent(other -> { throw new AppException(ErrorCode.NAME_EXISTED); });
            r.setRoleName(newName);
        }

        if (req.getDescription() != null) r.setDescription(req.getDescription());
        if (req.getIsActive() != null)    r.setIsActive(req.getIsActive());
        return ResponseEntity.ok(roleRepository.save(r));
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Void> delete(@PathVariable UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdminRole(r, "Cannot delete 'Admin' role.");
        roleRepository.deleteById(roleId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{roleId}/permissions")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<List<Permission>> listPermissions(@PathVariable UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        return ResponseEntity.ok(new ArrayList<>(role.getPermissions()));
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Void> addPermission(@PathVariable UUID roleId,
                                              @PathVariable UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdminRole(role, "Cannot modify permissions of 'Admin' role.");

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        role.getPermissions().add(permission);
        roleRepository.save(role);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Void> removePermission(@PathVariable UUID roleId,
                                                 @PathVariable UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdminRole(role, "Cannot modify permissions of 'Admin' role.");

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        role.getPermissions().remove(permission);
        roleRepository.save(role);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{roleId}/permissions")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Role> replacePermissions(@PathVariable UUID roleId,
                                                   @RequestBody com.g127.snapbuy.dto.request.RolePermissionUpdateRequest req) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureNotAdminRole(role, "Cannot modify permissions of 'Admin' role.");

        Set<Permission> newSet = new HashSet<>();
        if (req.getPermissionIds() != null) {
            for (UUID pid : req.getPermissionIds()) {
                Permission p = permissionRepository.findById(pid)
                        .orElseThrow(() -> new NoSuchElementException("Permission not found: " + pid));
                newSet.add(p);
            }
        }
        role.setPermissions(newSet);
        return ResponseEntity.ok(roleRepository.save(role));
    }

    private void ensureNotAdminRole(Role role, String message) {
        if (role.getRoleName() != null && ADMIN_ROLE_NAME.equalsIgnoreCase(role.getRoleName())) {
            throw new IllegalArgumentException(message);
        }
    }
}
