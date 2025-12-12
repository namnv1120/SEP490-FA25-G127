package com.g127.snapbuy.account.service.impl;

import com.g127.snapbuy.account.dto.request.*;
import com.g127.snapbuy.account.dto.response.AccountResponse;
import com.g127.snapbuy.response.PageResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.Role;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.AccountMapper;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.RoleRepository;
import com.g127.snapbuy.account.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
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

    @Value("${upload.dir}")
    private String uploadDir;

    private static final Set<String> FORBIDDEN_STAFF_ROLES = Set.of("Chủ cửa hàng");

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? null : auth.getName();
    }

    private void ensureActive(Role r) {
        if (r.getActive() != null && !r.getActive()) {
            throw new IllegalStateException("Vai trò đang ở trạng thái không hoạt động");
        }
    }

    // Admin methods removed - now managed in Master DB

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
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Tên đăng nhập/Email/SĐT đã tồn tại hoặc dữ liệu không hợp lệ");
        }
        return accountMapper.toResponse(acc);
    }

    private AccountResponse createWithSingleRole(AccountCreateRequest req, String roleName) {
        validateNewAccount(req);

        Role role = roleRepository.findByRoleNameIgnoreCase(roleName)
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
        } catch (DataIntegrityViolationException e) {
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
        if (accountRepository.existsByUsernameIgnoreCase(username))
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại");
    }

    @Override
    public AccountResponse getMyInfo() {
        String username = getCurrentUsername();
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));
        return accountMapper.toResponse(acc);
    }

    @Override
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public List<AccountResponse> getAccounts() {
        return accountRepository.findAll().stream().map(accountMapper::toResponse).toList();
    }

    @Override
    @PreAuthorize("hasAnyRole('Chủ cửa hàng','Nhân viên bán hàng')")
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

        // Kiểm tra mật khẩu mới không được giống mật khẩu cũ
        if (passwordEncoder.matches(req.getNewPassword(), acc.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu mới không được giống mật khẩu cũ");
        }

        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        acc.setTokenVersion((acc.getTokenVersion() == null ? 0 : acc.getTokenVersion()) + 1);
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

        // Kiểm tra mật khẩu mới không được giống mật khẩu cũ
        if (passwordEncoder.matches(req.getNewPassword(), acc.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu mới không được giống mật khẩu cũ");
        }

        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        acc.setTokenVersion((acc.getTokenVersion() == null ? 0 : acc.getTokenVersion()) + 1);
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
        acc.setTokenVersion((acc.getTokenVersion() == null ? 0 : acc.getTokenVersion()) + 1);
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
        acc.setTokenVersion((acc.getTokenVersion() == null ? 0 : acc.getTokenVersion()) + 1);
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
            staff.setActive(req.getActive());
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
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public AccountResponse getStaffByIdForOwner(UUID staffId) {
        Account staff = accountRepository.findById(staffId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        // Prevent accessing admin or owner accounts
        boolean forbidden = staff.getRoles().stream()
                .anyMatch(r -> FORBIDDEN_STAFF_ROLES.stream()
                        .anyMatch(f -> f.equalsIgnoreCase(r.getRoleName())));
        if (forbidden) {
            throw new IllegalArgumentException("Không thể truy cập tài khoản Chủ cửa hàng");
        }

        return accountMapper.toResponse(staff);
    }


    @Override
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public AccountResponse adminUpdateAccount(UUID accountId, AccountUpdateRequest req) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        if (req.getActive() != null && Boolean.FALSE.equals(req.getActive())
                && acc.getUsername().equalsIgnoreCase(getCurrentUsername())) {
            throw new IllegalStateException("Bạn không thể tự vô hiệu hóa tài khoản của mình");
        }

        if (req.getFullName() != null) acc.setFullName(req.getFullName());
        if (req.getEmail() != null) {
            String newEmail = req.getEmail().trim();
            // Nếu email là chuỗi rỗng, set về null
            String emailToSet = newEmail.isEmpty() ? null : newEmail;
            String currentEmail = acc.getEmail() != null ? acc.getEmail().trim() : "";

            // Chỉ cập nhật nếu email mới khác email hiện tại
            String currentEmailForCompare = currentEmail.isEmpty() ? null : currentEmail;
            if (!Objects.equals(emailToSet, currentEmailForCompare)) {
                // Chỉ kiểm tra email đã được sử dụng nếu email không rỗng
                if (emailToSet != null && accountRepository.existsByEmailIgnoreCase(emailToSet)) {
                    throw new IllegalArgumentException("Email này đã được sử dụng bởi tài khoản khác");
                }
                acc.setEmail(emailToSet);
            }
        }
        if (req.getPhone() != null) {
            String phoneToSet = req.getPhone().trim();
            // Nếu phone là chuỗi rỗng, set về null
            acc.setPhone(phoneToSet.isEmpty() ? null : phoneToSet);
        }
        if (req.getAvatarUrl() != null) acc.setAvatarUrl(req.getAvatarUrl());
        if (req.getActive() != null) acc.setActive(req.getActive());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            acc.setTokenVersion((acc.getTokenVersion() == null ? 0 : acc.getTokenVersion()) + 1);
        }

        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            if (req.getRoles().size() > 1) {
                throw new IllegalArgumentException("Chỉ được chọn 1 vai trò cho tài khoản");
            }

            String roleName = req.getRoles().get(0);
            Role role = roleRepository.findByRoleNameIgnoreCase(roleName)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy vai trò: " + roleName));
            ensureActive(role);

            acc.getRoles().clear();
            acc.getRoles().add(role);
            acc.setTokenVersion((acc.getTokenVersion() == null ? 0 : acc.getTokenVersion()) + 1);
        }
        return accountMapper.toResponse(accountRepository.save(acc));
    }

    @Override
    public AccountResponse updateAccount(UUID accountId, AccountUpdateRequest req) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        String currentUser = getCurrentUsername();
        if (!Objects.equals(acc.getUsername(), currentUser))
            throw new IllegalStateException("Bạn chỉ có thể cập nhật tài khoản của chính mình");

        if (req.getRoles() != null && !req.getRoles().isEmpty()) {
            throw new IllegalStateException("Không được cập nhật vai trò");
        }

        if (req.getFullName() != null) acc.setFullName(req.getFullName());
        if (req.getEmail() != null) {
            String newEmail = req.getEmail().trim();
            // Nếu email là chuỗi rỗng, set về null
            String emailToSet = newEmail.isEmpty() ? null : newEmail;
            String currentEmail = acc.getEmail() != null ? acc.getEmail().trim() : "";

            // Chỉ cập nhật nếu email mới khác email hiện tại
            String currentEmailForCompare = currentEmail.isEmpty() ? null : currentEmail;
            if (!Objects.equals(emailToSet, currentEmailForCompare)) {
                // Chỉ kiểm tra email đã được sử dụng nếu email không rỗng
                if (emailToSet != null && accountRepository.existsByEmailIgnoreCase(emailToSet)) {
                    throw new IllegalArgumentException("Email này đã được sử dụng bởi tài khoản khác");
                }
                acc.setEmail(emailToSet);
            }
        }
        if (req.getPhone() != null) {
            String phoneToSet = req.getPhone().trim();
            // Nếu phone là chuỗi rỗng, set về null
            acc.setPhone(phoneToSet.isEmpty() ? null : phoneToSet);
        }

        if (req.getRemoveAvatar() != null && req.getRemoveAvatar()) {
            acc.setAvatarUrl(null);
        } else if (req.getAvatar() != null && !req.getAvatar().isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + req.getAvatar().getOriginalFilename();
                Path uploadPath = Paths.get(uploadDir, "avatars").toAbsolutePath();

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName);
                req.getAvatar().transferTo(filePath.toFile());

                acc.setAvatarUrl("/uploads/avatars/" + fileName);
            } catch (Exception e) {
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
        } else if (req.getAvatarUrl() != null) {
            acc.setAvatarUrl(req.getAvatarUrl());
        }

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            acc.setTokenVersion((acc.getTokenVersion() == null ? 0 : acc.getTokenVersion()) + 1);
        }

        // Role updates removed - owner manages this through separate endpoint

        return accountMapper.toResponse(accountRepository.save(acc));
    }

    @Override
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public void deleteAccount(UUID accountId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        String currentUser = getCurrentUsername();
        if (currentUser != null && currentUser.equalsIgnoreCase(acc.getUsername()))
            throw new IllegalStateException("Bạn không thể xóa tài khoản của chính mình");

        boolean hasProtectedRole = acc.getRoles().stream()
                .anyMatch(r -> "Chủ cửa hàng".equalsIgnoreCase(r.getRoleName()));
        if (hasProtectedRole) throw new IllegalStateException("Không thể xóa tài khoản có vai trò được bảo vệ");

        accountRepository.delete(acc);
    }

    @Override
    public AccountResponse toggleAccountStatus(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        String currentUser = getCurrentUsername();
        if (account.getUsername().equalsIgnoreCase(currentUser)) {
            throw new IllegalStateException("Bạn không thể tự vô hiệu hóa tài khoản của chính mình");
        }

        Boolean currentActive = account.getActive();
        account.setActive(currentActive == null || !currentActive);
        account.setUpdatedDate(LocalDateTime.now());
        account.setTokenVersion((account.getTokenVersion() == null ? 0 : account.getTokenVersion()) + 1);
        Account savedAccount = accountRepository.save(account);
        return accountMapper.toResponse(savedAccount);
    }

    @Override
    public List<AccountResponse> getAccountsByRoleName(String roleName) {
        List<Account> accounts = accountRepository.findByRoleName(roleName);
        return accounts.stream()
                .map(accountMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public List<AccountResponse> searchAccounts(String keyword, Boolean active, String roleName) {
        List<Account> accounts = accountRepository.searchAccounts(
                keyword == null || keyword.isBlank() ? null : keyword.trim(),
                active,
                roleName == null || roleName.isBlank() ? null : roleName.trim()
        );
        return accounts.stream().map(accountMapper::toResponse).toList();
    }

    @Override
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public PageResponse<AccountResponse> searchAccountsPaged(String keyword, Boolean active, String roleName, Pageable pageable) {
        var page = accountRepository.searchAccountsPage(
                keyword == null || keyword.isBlank() ? null : keyword.trim(),
                active,
                roleName == null || roleName.isBlank() ? null : roleName.trim(),
                pageable
        );
        var content = page.getContent().stream().map(accountMapper::toResponse).toList();
        return PageResponse.<AccountResponse>builder()
                .content(content)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .size(page.getSize())
                .number(page.getNumber())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }

    @Override
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public PageResponse<AccountResponse> searchStaffAccountsPaged(String keyword, Boolean active, String roleName,
                                                                  Pageable pageable) {
        List<String> allowedRoles = List.of("Nhân viên bán hàng", "Nhân viên kho");
        List<String> roleFilterList;
        if (roleName != null && !roleName.isBlank() && allowedRoles.contains(roleName.trim())) {
            roleFilterList = List.of(roleName.trim());
        } else {
            roleFilterList = allowedRoles;
        }
        var page = accountRepository.searchStaffAccountsPage(
                keyword == null || keyword.isBlank() ? null : keyword.trim(),
                active,
                roleFilterList,
                pageable
        );
        var content = page.getContent().stream().map(accountMapper::toResponse).toList();
        return PageResponse.<AccountResponse>builder()
                .content(content)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .size(page.getSize())
                .number(page.getNumber())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }
}


