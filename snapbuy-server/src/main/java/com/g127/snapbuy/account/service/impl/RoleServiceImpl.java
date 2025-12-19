package com.g127.snapbuy.account.service.impl;

import com.g127.snapbuy.account.dto.request.RoleCreateRequest;
import com.g127.snapbuy.account.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.account.dto.response.RoleResponse;
import com.g127.snapbuy.account.entity.Role;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.account.repository.RoleRepository;
import com.g127.snapbuy.account.service.RoleService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.g127.snapbuy.common.utils.VietnameseUtils;

import java.time.ZoneOffset;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
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

    private RoleResponse toResponse(Role r) {
        // Trả về giá trị active thực tế từ entity (có thể là true, false, hoặc null)
        // Frontend sẽ xử lý để hiển thị đúng
        Boolean activeValue = r.getActive();
        return RoleResponse.builder()
                .id(r.getRoleId() != null ? r.getRoleId().toString() : null)
                .roleName(r.getRoleName())
                .description(r.getDescription())
                .active(activeValue != null ? activeValue : false) // Nếu null thì mặc định là false
                .createdDate(r.getCreatedDate() == null ? null :
                        r.getCreatedDate().toInstant().atOffset(ZoneOffset.UTC).toString())
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
        return toResponse(roleRepository.save(r));
    }

    @Override
    public List<RoleResponse> getAllRoles(Optional<Boolean> activeFilter) {
        // Giống như Account, trả về tất cả roles (bao gồm cả inactive) để admin quản lý
        // Không filter theo active
        List<Role> all = roleRepository.findAll();
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

        // Không cho phép cập nhật active từ request, chỉ cho phép qua toggle
        // if (req.getActive() != null) {
        //     r.setActive(req.getActive());
        // }

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
    @Transactional
    public RoleResponse toggleRoleStatus(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));
        
        ensureNotSystemRole(role,
                "Không thể thay đổi trạng thái vai trò 'Quản trị viên'",
                "Chủ cửa hàng không được phép thay đổi trạng thái vai trò 'Chủ cửa hàng'");
        
        if (currentUserHasRole(role)) {
            throw new IllegalStateException("Bạn không thể thay đổi trạng thái vai trò mà chính bạn đang sở hữu");
        }
        
        Boolean currentActive = role.getActive();
        role.setActive(currentActive == null || !currentActive);
        Role savedRole = roleRepository.save(role);
        return toResponse(savedRole);
    }

    @Override
    public PageResponse<RoleResponse> searchRolesPaged(String keyword, Boolean active, Pageable pageable) {
        // Lấy từ DB không có bộ lọc keyword
        List<Role> roles = roleRepository.findRolesForSearch(active);
        
        // Lọc theo keyword trong Java sử dụng VietnameseUtils
        String trimmedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        if (trimmedKeyword != null) {
            roles = roles.stream()
                .filter(r -> VietnameseUtils.matchesAny(trimmedKeyword, r.getRoleName(), r.getDescription()))
                .toList();
        }
        
        // Phân trang thủ công
        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int totalElements = roles.size();
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        int fromIndex = pageNumber * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, totalElements);
        
        List<Role> pagedRoles = (fromIndex < totalElements) 
            ? roles.subList(fromIndex, toIndex) 
            : List.of();
        
        var content = pagedRoles.stream().map(this::toResponse).toList();
        return PageResponse.<RoleResponse>builder()
                .content(content)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .size(pageSize)
                .number(pageNumber)
                .first(pageNumber == 0)
                .last(pageNumber >= totalPages - 1)
                .empty(content.isEmpty())
                .build();
    }
}
