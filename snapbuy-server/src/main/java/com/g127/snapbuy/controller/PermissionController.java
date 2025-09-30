package com.g127.snapbuy.controller;

import com.g127.snapbuy.entity.Permission;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionRepository permissionRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Permission> create(@RequestBody Permission req) {
        String name = req.getPermissionName() == null ? null : req.getPermissionName().trim();
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("permissionName is required");
        }
        if (permissionRepository.existsByPermissionNameIgnoreCase(name)) {
            throw new AppException(ErrorCode.NAME_EXISTED);
        }

        Permission p = new Permission();
        p.setPermissionId(UUID.randomUUID());
        p.setPermissionName(name);
        p.setDescription(req.getDescription());
        p.setModule(req.getModule());
        p.setIsActive(req.getIsActive() == null ? Boolean.TRUE : req.getIsActive());
        return ResponseEntity.status(HttpStatus.CREATED).body(permissionRepository.save(p));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<List<Permission>> list() {
        return ResponseEntity.ok(permissionRepository.findAll());
    }

    @GetMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Permission> get(@PathVariable UUID permissionId) {
        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        return ResponseEntity.ok(p);
    }

    @PutMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Permission> update(@PathVariable UUID permissionId, @RequestBody Permission req) {
        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));

        if (req.getPermissionName() != null) {
            String newName = req.getPermissionName().trim();
            if (newName.isBlank()) throw new IllegalArgumentException("permissionName must not be blank");

            permissionRepository.findByPermissionNameIgnoreCase(newName)
                    .filter(other -> !other.getPermissionId().equals(permissionId))
                    .ifPresent(other -> { throw new AppException(ErrorCode.NAME_EXISTED); });

            p.setPermissionName(newName);
        }
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getModule() != null) p.setModule(req.getModule());
        if (req.getIsActive() != null) p.setIsActive(req.getIsActive());

        return ResponseEntity.ok(permissionRepository.save(p));
    }

    @DeleteMapping("/{permissionId}")
    @PreAuthorize("hasAnyRole('Admin','Shop Owner')")
    public ResponseEntity<Void> delete(@PathVariable UUID permissionId) {
        permissionRepository.deleteById(permissionId);
        return ResponseEntity.noContent().build();
    }
}
