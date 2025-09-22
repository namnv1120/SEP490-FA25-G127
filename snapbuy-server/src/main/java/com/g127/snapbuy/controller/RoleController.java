package com.g127.snapbuy.controller;

import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> createRole(@RequestBody Role req) {
        Role r = new Role();
        r.setRoleId(UUID.randomUUID());
        r.setRoleName(req.getRoleName());
        r.setDisplayName(req.getDisplayName());
        r.setDescription(req.getDescription());
        r.setStatus(req.getStatus() == null ? "Active" : req.getStatus());
        r.setCreatedAt(LocalDateTime.now());
        r.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(roleRepository.save(r));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Role>> list() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @GetMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> get(@PathVariable UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        return ResponseEntity.ok(r);
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> update(@PathVariable UUID roleId, @RequestBody Role req) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        if (req.getRoleName() != null) r.setRoleName(req.getRoleName());
        if (req.getDisplayName() != null) r.setDisplayName(req.getDisplayName());
        if (req.getDescription() != null) r.setDescription(req.getDescription());
        if (req.getStatus() != null) r.setStatus(req.getStatus());
        r.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(roleRepository.save(r));
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID roleId) {
        roleRepository.deleteById(roleId);
        return ResponseEntity.noContent().build();
    }

    // ===== Permissions of a role =====
    @GetMapping("/{roleId}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Permission>> listPermissions(@PathVariable UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        var perms = rolePermissionRepository.findByRole(role)
                .stream().map(RolePermission::getPermission).collect(Collectors.toList());
        return ResponseEntity.ok(perms);
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> addPermission(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId,
            @RequestParam(defaultValue = "true") boolean granted
    ) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));

        RolePermission rp = rolePermissionRepository
                .findByRoleAndPermission(role, permission)
                .orElseGet(RolePermission::new);

        if (rp.getRolePermissionId() == null) rp.setRolePermissionId(UUID.randomUUID());
        rp.setRole(role);
        rp.setPermission(permission);
        rp.setGranted(granted);
        if (rp.getCreatedAt() == null) rp.setCreatedAt(LocalDateTime.now());
        rolePermissionRepository.save(rp);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removePermission(
            @PathVariable UUID roleId,
            @PathVariable UUID permissionId
    ) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        rolePermissionRepository.deleteByRoleAndPermission(role, permission);
        return ResponseEntity.noContent().build();
    }
}
