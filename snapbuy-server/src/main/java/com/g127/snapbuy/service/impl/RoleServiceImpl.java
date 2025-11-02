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

    private static final String ADMIN = "Quản trị viên";
    private static final String OWNER = "Chủ cửa hàng";

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> ("ROLE_" + ADMIN).equalsIgnoreCase(a.getAuthority()));
    }

    private boolean isOwner() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> ("ROLE_" + OWNER).equalsIgnoreCase(a.getAuthority()));
    }

    private void ensureNotSystemRole(Role r, String adminMsg, String ownerMsg) {
        if (r == null || r.getRoleName() == null) return;
        String rn = r.getRoleName();
        if (ADMIN.equalsIgnoreCase(rn)) {
            throw new IllegalStateException(adminMsg);
        }
        if (isOwner() && OWNER.equalsIgnoreCase(rn)) {
            throw new IllegalStateException(ownerMsg);
        }
    }

    private void ensureActive(Role r) {
        if (Boolean.FALSE.equals(r.getActive())) {
            throw new IllegalStateException("Vai trò đang ở trạng thái không hoạt động");
        }
    }

    private void ensureActive(Permission p) {
        if (Boolean.FALSE.equals(p.getIsActive())) {
            throw new IllegalStateException("Quyền đang ở trạng thái không hoạt động");
        }
    }

    private PermissionResponse toPermissionResponse(Permission p) {
        return PermissionResponse.builder()
                .id(p.getPermissionId().toString())
                .name(p.getPermissionName())
                .description(p.getDescription())
                .module(p.getModule())
                .active(Boolean.TRUE.equals(p.getIsActive()))
                .build();
    }

    private RoleResponse toResponse(Role r) {
        return RoleResponse.builder()
                .id(r.getRoleId() != null ? r.getRoleId().toString() : null)
                .roleName(r.getRoleName())
                .description(r.getDescription())
                .active(Boolean.TRUE.equals(r.getActive()))
                .createdDate(r.getCreatedDate() == null ? null :
                        r.getCreatedDate().toInstant().atOffset(ZoneOffset.UTC).toString())
                .permissions(r.getPermissions() == null ? List.of() :
                        r.getPermissions().stream().map(this::toPermissionResponse).toList())
                .build();
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleCreateRequest req) {
        String name = req.getRoleName().trim();
        if (ADMIN.equalsIgnoreCase(name)) {
            throw new IllegalArgumentException("Không thể tạo vai trò 'Quản trị viên'");
        }
        if (roleRepository.existsByRoleNameIgnoreCase(name)) {
            throw new AppException(ErrorCode.NAME_EXISTED);
        }

        Role r = new Role();
        r.setRoleName(name);
        r.setDescription(req.getDescription());
        r.setActive(req.getActive() == null ? Boolean.TRUE : req.getActive());
        r.setCreatedDate(new Date());
        r.setPermissions(new HashSet<>());
        return toResponse(roleRepository.save(r));
    }

    @Override
    public List<RoleResponse> getAllRoles(Optional<Boolean> activeFilter) {
        List<Role> all = roleRepository.findAll();
        if (activeFilter.isPresent()) {
            Boolean f = activeFilter.get();
            all = all.stream()
                    .filter(r -> Objects.equals(Boolean.TRUE.equals(r.getActive()), f))
                    .toList();
        } else {
            all = all.stream().filter(r -> Boolean.TRUE.equals(r.getActive())).toList();
        }
        return all.stream().map(this::toResponse).toList();
    }

    @Override
    public RoleResponse getRoleById(UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));
        return toResponse(r);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(UUID roleId, RoleUpdateRequest req) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));

        ensureNotSystemRole(r,
                "Không thể cập nhật vai trò 'Quản trị viên'",
                "Chủ cửa hàng không được phép chỉnh sửa vai trò 'Chủ cửa hàng'");

        boolean admin = isAdmin();

        if (req.getRoleName() != null) {
            if (!admin) throw new IllegalArgumentException("Chỉ 'Quản trị viên' mới được đổi tên vai trò");
            String newName = req.getRoleName().trim();
            if (ADMIN.equalsIgnoreCase(newName))
                throw new IllegalArgumentException("Không thể đổi tên thành 'Quản trị viên'");
            roleRepository.findByRoleNameIgnoreCase(newName)
                    .filter(other -> !other.getRoleId().equals(roleId))
                    .ifPresent(other -> {
                        throw new AppException(ErrorCode.NAME_EXISTED);
                    });
            r.setRoleName(newName);
        }

        if (req.getDescription() != null) {
            if (!admin) throw new IllegalArgumentException("Chỉ 'Quản trị viên' mới được cập nhật mô tả");
            r.setDescription(req.getDescription());
        }

        if (req.getActive() != null) {
            r.setActive(req.getActive());
        }

        return toResponse(roleRepository.save(r));
    }

    private boolean currentUserHasRole(Role role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || role == null || role.getRoleName() == null) return false;

        final String marker = "ROLE_" + role.getRoleName();
        return auth.getAuthorities().stream()
                .anyMatch(a -> marker.equalsIgnoreCase(a.getAuthority()));
    }

    @Override
    @Transactional
    public void deleteRole(UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));

        ensureNotSystemRole(r,
                "Không thể xóa vai trò 'Quản trị viên'",
                "Chủ cửa hàng không được phép xóa vai trò 'Chủ cửa hàng'");

        if (currentUserHasRole(r)) {
            throw new IllegalStateException("Bạn không thể xóa vai trò mà chính bạn đang sở hữu");
        }

        long inUse = accountRepository.countAccountsByRoleId(roleId);
        if (inUse > 0) {
            throw new IllegalStateException("Vai trò đang được sử dụng bởi " + inUse + " tài khoản. Hãy gỡ gán trước.");
        }
        roleRepository.deleteById(roleId);
    }

    @Override
    public List<PermissionResponse> listPermissions(UUID roleId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));
        return r.getPermissions().stream().map(this::toPermissionResponse).toList();
    }

    @Override
    @Transactional
    public void addPermission(UUID roleId, UUID permissionId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));
        ensureNotSystemRole(r,
                "Không thể chỉnh sửa vai trò 'Chủ hệ thống'",
                "Chủ cửa hàng không được phép chỉnh sửa vai trò 'Chủ cửa hàng'");
        ensureActive(r);

        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy quyền"));
        ensureActive(p);

        r.getPermissions().add(p);
        roleRepository.save(r);
    }

    @Override
    @Transactional
    public void removePermission(UUID roleId, UUID permissionId) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));
        ensureNotSystemRole(r,
                "Không thể chỉnh sửa vai trò 'Chủ hệ thống'",
                "Chủ cửa hàng không được phép chỉnh sửa vai trò 'Chủ cửa hàng'");
        ensureActive(r);

        Permission p = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy quyền"));
        ensureActive(p);

        r.getPermissions().remove(p);
        roleRepository.save(r);
    }

    @Override
    @Transactional
    public RoleResponse setPermissions(UUID roleId, RolePermissionUpdateRequest req) {
        Role r = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));
        ensureNotSystemRole(r,
                "Không thể chỉnh sửa vai trò 'Quản trị viên'",
                "Chủ cửa hàng không được phép chỉnh sửa vai trò 'Chủ cửa hàng'");
        ensureActive(r);

        Set<Permission> newSet = new HashSet<>();
        if (req.getPermissionIds() != null) {
            for (UUID pid : new HashSet<>(req.getPermissionIds())) {
                Permission p = permissionRepository.findById(pid)
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy quyền: " + pid));
                ensureActive(p);
                newSet.add(p);
            }
        }
        r.setPermissions(newSet);
        return toResponse(roleRepository.save(r));
    }
}
