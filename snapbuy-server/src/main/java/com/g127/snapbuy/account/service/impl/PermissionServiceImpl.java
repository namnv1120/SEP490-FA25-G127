package com.g127.snapbuy.account.service.impl;

import com.g127.snapbuy.account.dto.request.PermissionCreateRequest;
import com.g127.snapbuy.account.dto.request.PermissionUpdateRequest;
import com.g127.snapbuy.account.dto.response.PermissionResponse;
import com.g127.snapbuy.account.entity.Permission;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.account.repository.PermissionRepository;
import com.g127.snapbuy.account.service.PermissionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_Quản trị viên".equalsIgnoreCase(a.getAuthority()));
    }

    private PermissionResponse toResponse(Permission p) {
        return PermissionResponse.builder()
                .id(p.getPermissionId() == null ? null : p.getPermissionId().toString())
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
    public List<PermissionResponse> getAllPermissions(Optional<Boolean> activeFilter) {
        List<Permission> all = permissionRepository.findAll();
        if (activeFilter.isPresent()) {
            Boolean f = activeFilter.get();
            if (f != null) {
                all = all.stream().filter(p -> Boolean.TRUE.equals(p.getIsActive()) == f).toList();
            }
        } else {
            all = all.stream().filter(p -> Boolean.TRUE.equals(p.getIsActive())).toList();
        }
        return all.stream().map(this::toResponse).toList();
    }

    @Override
    public PermissionResponse getPermissionById(UUID id) {
        Permission p = permissionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy quyền"));
        return toResponse(p);
    }

    @Override
    @Transactional
    public PermissionResponse updatePermission(UUID id, PermissionUpdateRequest req) {
        Permission p = permissionRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy quyền"));

        boolean admin = isAdmin();

        if (req.getPermissionName() != null) {
            if (!admin) throw new IllegalArgumentException("Chỉ 'Quản trị viên' mới được đổi tên quyền");
            String newName = req.getPermissionName().trim();
            permissionRepository.findByPermissionNameIgnoreCase(newName)
                    .filter(other -> !other.getPermissionId().equals(id))
                    .ifPresent(other -> { throw new AppException(ErrorCode.NAME_EXISTED); });
            p.setPermissionName(newName);
        }
        if (req.getDescription() != null) {
            if (!admin) throw new IllegalArgumentException("Chỉ 'Quản trị viên' mới được cập nhật mô tả");
            p.setDescription(req.getDescription());
        }
        if (req.getModule() != null) {
            if (!admin) throw new IllegalArgumentException("Chỉ 'Quản trị viên' mới được cập nhật module");
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
