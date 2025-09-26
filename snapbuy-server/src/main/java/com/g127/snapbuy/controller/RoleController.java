package com.g127.snapbuy.controller;

import com.g127.snapbuy.entity.Permission;
import com.g127.snapbuy.entity.Role;
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

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Role> createRole(@RequestBody Role req) {
        Role r = new Role();
        r.setRoleName(req.getRoleName());
        r.setDescription(req.getDescription());
        r.setIsActive(req.getIsActive() == null ? Boolean.TRUE : req.getIsActive());
        r.setCreatedDate(new Date());
        return ResponseEntity.status(HttpStatus.CREATED).body(roleRepository.save(r));
    }

    @GetMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<Role>> list() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @GetMapping("/{roleId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Role> get(@PathVariable UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        return ResponseEntity.ok(r);
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Role> update(@PathVariable UUID roleId, @RequestBody Role req) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        if (req.getRoleName() != null) r.setRoleName(req.getRoleName());
        if (req.getDescription() != null) r.setDescription(req.getDescription());
        if (req.getIsActive() != null) r.setIsActive(req.getIsActive());
        return ResponseEntity.ok(roleRepository.save(r));
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> delete(@PathVariable UUID roleId) {
        roleRepository.deleteById(roleId);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{roleId}/permissions")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<Permission>> listPermissions(@PathVariable UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        return ResponseEntity.ok(new ArrayList<>(role.getPermissions()));
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> addPermission(@PathVariable UUID roleId, @PathVariable UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        role.getPermissions().add(permission);
        roleRepository.save(role);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> removePermission(@PathVariable UUID roleId, @PathVariable UUID permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        role.getPermissions().remove(permission);
        roleRepository.save(role);
        return ResponseEntity.noContent().build();
    }
}
