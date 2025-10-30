package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.AccountResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.Role;
import com.g127.snapbuy.mapper.AccountMapper;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.RoleRepository;
import com.g127.snapbuy.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder;

    private static final Set<String> FORBIDDEN_STAFF_ROLES = Set.of("Quản trị viên", "Chủ cửa hàng");

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? null : auth.getName();
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_Quản trị viên".equalsIgnoreCase(a.getAuthority()));
    }

    private void ensureActive(Role r) {
        if (r.getIsActive() != null && !r.getIsActive()) throw new IllegalStateException("Vai trò đang không hoạt động");
    }

    @Override
    @PreAuthorize("hasRole('Quản trị viên')")
    public AccountResponse createAccount(AccountCreateRequest req) {
        return createWithSingleRole(req, "Chủ cửa hàng");
    }

    @Override
    @PreAuthorize("hasRole('Quản trị viên')")
    public AccountResponse createShopOwner(AccountCreateRequest req) {
        return createWithSingleRole(req, "Chủ cửa hàng");
    }

    @Override
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public AccountResponse createStaff(AccountCreateRequest req) {
        validateNewAccount(req);

        List<String> roleNames = Optional.ofNullable(req.getRoles()).orElse(List.of());
        if (roleNames.isEmpty()) throw new IllegalArgumentException("Nhân viên phải có ít nhất 1 vai trò");
        for (String rn : roleNames) {
            if (FORBIDDEN_STAFF_ROLES.stream().anyMatch(f -> f.equalsIgnoreCase(rn))) {
                throw new IllegalArgumentException("Vai trò không hợp lệ cho nhân viên: " + rn);
            }
        }

        Set<Role> staffRoles = roleNames.stream()
                .map(rn -> roleRepository.findByRoleNameIgnoreCase(rn)
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò: " + rn)))
                .peek(this::ensureActive)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Account acc = accountMapper.toEntity(req);
        acc.setUsername(req.getUsername().toLowerCase());
        acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        acc.setRoles(new LinkedHashSet<>());

        try {
            acc = accountRepository.save(acc);
            acc.getRoles().addAll(staffRoles);
            acc = accountRepository.save(acc);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Tên đăng nhập/Email/SĐT đã tồn tại hoặc dữ liệu không hợp lệ");
        }
        return accountMapper.toResponse(acc);
    }

    private AccountResponse createWithSingleRole(AccountCreateRequest req, String roleName) {
        validateNewAccount(req);

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò: " + roleName));
        ensureActive(role);

        Account account = accountMapper.toEntity(req);
        account.setUsername(req.getUsername().toLowerCase());
        account.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        account.setRoles(new LinkedHashSet<>());

        try {
            account = accountRepository.save(account);
            account.getRoles().add(role);
            account = accountRepository.save(account);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Tên đăng nhập/Email/SĐT đã tồn tại hoặc dữ liệu không hợp lệ");
        }
        return accountMapper.toResponse(account);
    }

    private void validateNewAccount(AccountCreateRequest req) {
        if (req.getPassword() == null || req.getConfirmPassword() == null
                || !req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
        }
        String username = req.getUsername().toLowerCase();
        if (username.contains(" ")) throw new IllegalArgumentException("Tên đăng nhập không được chứa khoảng trắng");
        if (accountRepository.existsByUsernameIgnoreCase(username)) throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
        if (accountRepository.existsByEmailIgnoreCase(req.getEmail())) throw new IllegalArgumentException("Email đã tồn tại");
        if (req.getPhone() != null && !req.getPhone().isBlank() && accountRepository.existsByPhone(req.getPhone())) {
            throw new IllegalArgumentException("Số điện thoại đã tồn tại");
        }
    }

    @Override
    public AccountResponse getMyInfo() {
        String username = getCurrentUsername();
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));
        return accountMapper.toResponse(acc);
    }

    @Override
    @PreAuthorize("hasRole('Quản trị viên')")
    public List<AccountResponse> getAccounts() {
        return accountRepository.findAll().stream().map(accountMapper::toResponse).toList();
    }

    @Override
    @PreAuthorize("hasRole('Quản trị viên')")
    public AccountResponse getAccount(UUID id) {
        Account acc = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));
        return accountMapper.toResponse(acc);
    }

    @Override
    public AccountResponse changePassword(UUID accountId, ChangePasswordRequest req) {
        if (!Objects.equals(req.getNewPassword(), req.getConfirmNewPassword()))
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");

        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));
        if (!passwordEncoder.matches(req.getOldPassword(), acc.getPasswordHash()))
            throw new IllegalArgumentException("Mật khẩu cũ không đúng");

        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        return accountMapper.toResponse(accountRepository.save(acc));
    }

    @Override
    public void changePasswordForCurrentUser(ChangePasswordRequest req) {
        if (!Objects.equals(req.getNewPassword(), req.getConfirmNewPassword()))
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");

        String username = getCurrentUsername();
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(req.getOldPassword(), acc.getPasswordHash()))
            throw new IllegalArgumentException("Mật khẩu cũ không đúng");

        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        accountRepository.save(acc);
    }

    @Override
    public AccountResponse assignRole(UUID accountId, UUID roleId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));
        ensureActive(role);

        acc.getRoles().add(role);
        accountRepository.save(acc);
        return accountMapper.toResponse(acc);
    }

    @Override
    public void unassignRole(UUID accountId, UUID roleId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò"));

        if ("Quản trị viên".equalsIgnoreCase(role.getRoleName())) {
            long adminCount = accountRepository.countAccountsByRoleId(roleId);
            if (adminCount <= 1) throw new IllegalStateException("Không thể gỡ vai trò Quản trị viên cuối cùng");
        }

        String currentUser = getCurrentUsername();
        if (acc.getUsername().equalsIgnoreCase(currentUser))
            throw new IllegalStateException("Bạn không thể tự gỡ vai trò của chính mình");

        acc.getRoles().remove(role);
        accountRepository.save(acc);
    }

    @Override
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public AccountResponse updateStaffByOwner(UUID staffId, StaffOwnerUpdateRequest req) {
        Account staff = accountRepository.findById(staffId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        boolean forbidden = staff.getRoles().stream()
                .anyMatch(r -> FORBIDDEN_STAFF_ROLES.stream().anyMatch(f -> f.equalsIgnoreCase(r.getRoleName())));
        if (forbidden) throw new IllegalArgumentException("Không thể chỉnh sửa Quản trị viên hoặc Chủ cửa hàng");

        if (req.getFullName() != null) staff.setFullName(req.getFullName());
        if (req.getEmail() != null) staff.setEmail(req.getEmail());
        if (req.getPhone() != null) staff.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) staff.setAvatarUrl(req.getAvatarUrl());
        if (req.getActive() != null) {
            if (staff.getUsername().equalsIgnoreCase(getCurrentUsername()))
                throw new IllegalStateException("Bạn không thể tự vô hiệu hóa chính mình");
            staff.setIsActive(req.getActive());
        }

        return accountMapper.toResponse(accountRepository.save(staff));
    }

    @Override
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public AccountResponse updateStaffRolesByOwner(UUID staffId, StaffRoleUpdateRequest req) {
        Account staff = accountRepository.findById(staffId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        for (String rn : req.getRoles()) {
            if (FORBIDDEN_STAFF_ROLES.stream().anyMatch(f -> f.equalsIgnoreCase(rn)))
                throw new IllegalArgumentException("Vai trò không hợp lệ cho nhân viên: " + rn);
        }

        Set<Role> newRoles = req.getRoles().stream()
                .map(rn -> roleRepository.findByRoleNameIgnoreCase(rn)
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò: " + rn)))
                .peek(this::ensureActive)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        staff.getRoles().clear();
        staff.getRoles().addAll(newRoles);
        return accountMapper.toResponse(accountRepository.save(staff));
    }

    @Override
    @PreAuthorize("hasRole('Quản trị viên')")
    public AccountResponse adminUpdateAccount(UUID accountId, AccountUpdateRequest req) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        if (req.getActive() != null && Boolean.FALSE.equals(req.getActive())
                && acc.getUsername().equalsIgnoreCase(getCurrentUsername())) {
            throw new IllegalStateException("Bạn không thể tự vô hiệu hóa tài khoản của mình");
        }

        if (req.getFullName() != null) acc.setFullName(req.getFullName());
        if (req.getEmail() != null) acc.setEmail(req.getEmail());
        if (req.getPhone() != null) acc.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) acc.setAvatarUrl(req.getAvatarUrl());
        if (req.getActive() != null) acc.setIsActive(req.getActive());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }

        return accountMapper.toResponse(accountRepository.save(acc));
    }

    @Override
    public AccountResponse updateAccount(UUID accountId, AccountUpdateRequest req) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        String currentUser = getCurrentUsername();
        if (!Objects.equals(acc.getUsername(), currentUser) && !isAdmin())
            throw new IllegalStateException("Bạn chỉ có thể cập nhật tài khoản của chính mình");

        if (req.getFullName() != null) acc.setFullName(req.getFullName());
        if (req.getEmail() != null) acc.setEmail(req.getEmail());
        if (req.getPhone() != null) acc.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) acc.setAvatarUrl(req.getAvatarUrl());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }

        return accountMapper.toResponse(accountRepository.save(acc));
    }

    @Override
    @PreAuthorize("hasRole('Quản trị viên')")
    public void deleteAccount(UUID accountId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        String currentUser = getCurrentUsername();
        if (currentUser != null && currentUser.equalsIgnoreCase(acc.getUsername()))
            throw new IllegalStateException("Bạn không thể xóa tài khoản của chính mình");

        boolean hasProtectedRole = acc.getRoles().stream()
                .anyMatch(r -> "Quản trị viên".equalsIgnoreCase(r.getRoleName())
                        || "Chủ cửa hàng".equalsIgnoreCase(r.getRoleName()));
        if (hasProtectedRole) throw new IllegalStateException("Không thể xóa tài khoản có vai trò được bảo vệ");

        accountRepository.delete(acc);
    }
}
