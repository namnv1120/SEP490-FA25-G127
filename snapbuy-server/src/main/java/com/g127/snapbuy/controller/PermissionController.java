package com.g127.snapbuy.controller;

import com.g127.snapbuy.entity.Permission;
import com.g127.snapbuy.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionRepository permissionRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Permission> create(@RequestBody Permission req) {
        Permission p = new Permission();
        p.setPermissionId(UUID.randomUUID());
        p.setPermissionName(req.getPermissionName());
        p.setResource(req.getResource());
        p.setAction(req.getAction());
        p.setDescription(req.getDescription());
        p.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(permissionRepository.save(p));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Permission>> list() {
        return ResponseEntity.ok(permissionRepository.findAll());
    }

    @GetMapping("/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Permission> get(@PathVariable UUID permissionId) {
        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        return ResponseEntity.ok(p);
    }

    @PutMapping("/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Permission> update(@PathVariable UUID permissionId, @RequestBody Permission req) {
        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        if (req.getPermissionName() != null) p.setPermissionName(req.getPermissionName());
        if (req.getResource() != null) p.setResource(req.getResource());
        if (req.getAction() != null) p.setAction(req.getAction());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        return ResponseEntity.ok(permissionRepository.save(p));
    }

    @DeleteMapping("/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID permissionId) {
        permissionRepository.deleteById(permissionId);
        return ResponseEntity.noContent().build();
    }
}
