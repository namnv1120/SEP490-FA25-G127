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
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    private PermissionResponse toResponse(Permission p) {
        return PermissionResponse.builder()
                .id(p.getPermissionId().toString())
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
        return permissionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PermissionResponse getPermissionById(UUID permissionId) {
        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));
        return toResponse(p);
    }

    @Override
    @Transactional
    public PermissionResponse updatePermission(UUID permissionId, PermissionUpdateRequest req) {
        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Permission not found"));

        if (req.getPermissionName() != null) p.setPermissionName(req.getPermissionName().trim());
        if (req.getDescription() != null) p.setDescription(req.getDescription());
        if (req.getModule() != null) p.setModule(req.getModule());
        if (req.getIsActive() != null) p.setIsActive(req.getIsActive());

        return toResponse(permissionRepository.save(p));
    }

    @Override
    @Transactional
    public void deletePermission(UUID permissionId) {
        if (!permissionRepository.existsById(permissionId)) {
            throw new NoSuchElementException("Permission not found");
        }
        permissionRepository.deleteById(permissionId);
    }
}
