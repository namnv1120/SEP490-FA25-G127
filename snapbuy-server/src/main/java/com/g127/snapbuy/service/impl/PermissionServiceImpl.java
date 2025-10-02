package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.PermissionCreateRequest;
import com.g127.snapbuy.dto.request.PermissionUpdateRequest;
import com.g127.snapbuy.dto.response.PermissionResponse;
import com.g127.snapbuy.entity.Permission;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.repository.PermissionRepository;
import com.g127.snapbuy.service.PermissionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if ("ROLE_Admin".equals(ga.getAuthority())) return true;
        }
        return false;
    }

    private PermissionResponse toResponse(Permission p) {
        return PermissionResponse.builder()
                .id(p.getPermissionId() != null ? p.getPermissionId().toString() : null)
                .name(p.getPermissionName())
                .description(p.getDescription())
                .module(p.getModule())
                .active(Boolean.TRUE.equals(p.getIsActive()))
                .build();
    }

    @Override
    @Transactional
    public PermissionResponse createPermission(PermissionCreateRequest req) {
        String name = req.getPermissionName().trim();
        if (permissionRepository.existsByPermissionNameIgnoreCase(name)) {
            throw new AppException(ErrorCode.NAME_EXISTED);
        }
        Permission p = new Permission();
        p.setPermissionName(name);
        p.setDescription(req.getDescription());
        p.setModule(req.getModule());
        p.setIsActive(req.getIsActive() == null ? Boolean.TRUE : req.getIsActive());
        return toResponse(permissionRepository.save(p));
    }

    @Override
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public PermissionResponse getPermissionById(UUID id) {
        Permission p = permissionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        return toResponse(p);
    }

    @Override
    @Transactional
    public PermissionResponse updatePermission(UUID id, PermissionUpdateRequest req) {
        Permission p = permissionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));

        boolean admin = isAdmin();

        if (req.getPermissionName() != null) {
            if (!admin) throw new IllegalArgumentException("Only Admin can rename permission");
            String newName = req.getPermissionName().trim();
            permissionRepository.findByPermissionNameIgnoreCase(newName)
                    .filter(other -> !other.getPermissionId().equals(id))
                    .ifPresent(other -> { throw new AppException(ErrorCode.NAME_EXISTED); });
            p.setPermissionName(newName);
        }

        if (req.getDescription() != null) {
            if (!admin) throw new IllegalArgumentException("Only Admin can update description");
            p.setDescription(req.getDescription());
        }

        if (req.getModule() != null) {
            if (!admin) throw new IllegalArgumentException("Only Admin can update module");
            p.setModule(req.getModule());
        }

        if (req.getIsActive() != null) {
            p.setIsActive(req.getIsActive());
        }

        return toResponse(permissionRepository.save(p));
    }

    @Override
    @Transactional
    public void deletePermission(UUID id) {
        permissionRepository.deleteById(id);
    }
}
