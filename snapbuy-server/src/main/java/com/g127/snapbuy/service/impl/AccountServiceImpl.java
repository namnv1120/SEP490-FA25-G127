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
import org.springframework.security.access.prepost.PostAuthorize;
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

    private static final Set<String> FORBIDDEN_STAFF_ROLES =
            Set.of("Admin", "Shop Owner");

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth == null ? null : auth.getName();
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_Admin".equals(a.getAuthority()));
    }

    private boolean isShopOwner() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_Shop Owner".equals(a.getAuthority()));
    }

    private void ensureActive(Role r) {
        if (r.getIsActive() != null && !r.getIsActive()) {
            throw new IllegalStateException("Role is inactive");
        }
    }


    @Override
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse createAccount(AccountCreateRequest req) {
        return createWithSingleRole(req, "Shop Owner");
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse createShopOwner(AccountCreateRequest req) {
        return createWithSingleRole(req, "Shop Owner");
    }

    @Override
    @PreAuthorize("hasRole('Shop Owner')")
    public AccountResponse createStaff(AccountCreateRequest req) {
        if (req.getPassword() == null || req.getConfirmPassword() == null
                || !req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Confirm password does not match");
        }

        String username = req.getUsername().toLowerCase();
        if (username.contains(" ")) {
            throw new IllegalArgumentException("Username must not contain spaces");
        }
        if (accountRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (accountRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()
                && accountRepository.existsByPhone(req.getPhone())) {
            throw new IllegalArgumentException("Phone already exists");
        }

        List<String> roleNames = Optional.ofNullable(req.getRoles()).orElse(List.of());
        if (roleNames.isEmpty()) {
            throw new IllegalArgumentException("At least one role is required for staff");
        }

        for (String rn : roleNames) {
            if (FORBIDDEN_STAFF_ROLES.stream().anyMatch(f -> f.equalsIgnoreCase(rn))) {
                throw new IllegalArgumentException("Role not allowed for staff: " + rn);
            }
        }

        Set<Role> staffRoles = new HashSet<>();
        for (String rn : roleNames) {
            Role r = roleRepository.findByRoleNameIgnoreCase(rn)
                    .orElseThrow(() -> new NoSuchElementException("Role not found: " + rn));
            ensureActive(r);
            staffRoles.add(r);
        }

        Account acc = accountMapper.toEntity(req);
        acc.setAccountId(UUID.randomUUID());
        acc.setUsername(username);
        acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        acc.setRoles(staffRoles);

        try {
            acc = accountRepository.save(acc);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Duplicate or invalid data");
        }
        return accountMapper.toResponse(acc);
    }

    private AccountResponse createWithSingleRole(AccountCreateRequest req, String roleName) {
        if (req.getPassword() == null || req.getConfirmPassword() == null
                || !req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Confirm password does not match");
        }

        String username = req.getUsername().toLowerCase();
        if (username.contains(" ")) {
            throw new IllegalArgumentException("Username must not contain spaces");
        }
        if (accountRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (accountRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        if (req.getPhone() != null && !req.getPhone().isBlank()
                && accountRepository.existsByPhone(req.getPhone())) {
            throw new IllegalArgumentException("Phone already exists");
        }

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new NoSuchElementException("Role not found: " + roleName));
        ensureActive(role);

        Account account = accountMapper.toEntity(req);
        account.setAccountId(UUID.randomUUID());
        account.setUsername(username);
        account.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        account.setRoles(Set.of(role));

        return accountMapper.toResponse(accountRepository.save(account));
    }


    @Override
    public AccountResponse getMyInfo() {
        String username = getCurrentUsername();
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));
        return accountMapper.toResponse(acc);
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public List<AccountResponse> getAccounts() {
        return accountRepository.findAll().stream()
                .map(accountMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse getAccount(UUID id) {
        Account acc = accountRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));
        return accountMapper.toResponse(acc);
    }


    @Override
    public AccountResponse changePassword(UUID accountId, ChangePasswordRequest req) {
        if (!Objects.equals(req.getNewPassword(), req.getConfirmNewPassword())) {
            throw new IllegalArgumentException("Confirm new password does not match");
        }

        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));
        if (!passwordEncoder.matches(req.getOldPassword(), acc.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        return accountMapper.toResponse(accountRepository.save(acc));
    }

    @Override
    public void changePasswordForCurrentUser(ChangePasswordRequest req) {
        if (!Objects.equals(req.getNewPassword(), req.getConfirmNewPassword())) {
            throw new IllegalArgumentException("Confirm new password does not match");
        }

        String username = getCurrentUsername();
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        if (!passwordEncoder.matches(req.getOldPassword(), acc.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        acc.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        accountRepository.save(acc);
    }


    @Override
    public AccountResponse assignRole(UUID accountId, UUID roleId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
        ensureActive(role);

        acc.getRoles().add(role);
        accountRepository.save(acc);
        return accountMapper.toResponse(acc);
    }

    @Override
    public void unassignRole(UUID accountId, UUID roleId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));

        if ("Admin".equalsIgnoreCase(role.getRoleName())) {
            long adminCount = accountRepository.countAccountsByRoleId(roleId);
            if (adminCount <= 1) {
                throw new IllegalStateException("Cannot unassign the last Admin");
            }
        }

        String currentUser = getCurrentUsername();
        if (acc.getUsername().equalsIgnoreCase(currentUser)) {
            throw new IllegalStateException("You cannot unassign your own role");
        }

        acc.getRoles().remove(role);
        accountRepository.save(acc);
    }


    @Override
    @PreAuthorize("hasRole('Shop Owner')")
    public AccountResponse updateStaffByOwner(UUID staffId, StaffOwnerUpdateRequest req) {
        Account staff = accountRepository.findById(staffId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        boolean forbidden = staff.getRoles().stream()
                .anyMatch(r -> FORBIDDEN_STAFF_ROLES.stream()
                        .anyMatch(f -> f.equalsIgnoreCase(r.getRoleName())));
        if (forbidden) {
            throw new IllegalArgumentException("Cannot modify Admin or Shop Owner");
        }

        if (req.getFullName() != null) staff.setFullName(req.getFullName());
        if (req.getEmail() != null) staff.setEmail(req.getEmail());
        if (req.getPhone() != null) staff.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) staff.setAvatarUrl(req.getAvatarUrl());
        if (req.getActive() != null) {
            if (staff.getUsername().equalsIgnoreCase(getCurrentUsername())) {
                throw new IllegalStateException("You cannot deactivate yourself");
            }
            staff.setIsActive(req.getActive());
        }

        return accountMapper.toResponse(accountRepository.save(staff));
    }

    @Override
    @PreAuthorize("hasRole('Shop Owner')")
    public AccountResponse updateStaffRolesByOwner(UUID staffId, StaffRoleUpdateRequest req) {
        Account staff = accountRepository.findById(staffId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        for (String rn : req.getRoles()) {
            if (FORBIDDEN_STAFF_ROLES.stream().anyMatch(f -> f.equalsIgnoreCase(rn))) {
                throw new IllegalArgumentException("Role not allowed for staff: " + rn);
            }
        }

        Set<Role> newRoles = new HashSet<>();
        for (String rn : req.getRoles()) {
            Role r = roleRepository.findByRoleNameIgnoreCase(rn)
                    .orElseThrow(() -> new NoSuchElementException("Role not found: " + rn));
            ensureActive(r);
            newRoles.add(r);
        }

        staff.getRoles().clear();
        staff.getRoles().addAll(newRoles);
        return accountMapper.toResponse(accountRepository.save(staff));
    }


    @Override
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse adminUpdateAccount(UUID accountId, AccountUpdateRequest req) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        if (req.getActive() != null && Boolean.FALSE.equals(req.getActive())
                && acc.getUsername().equalsIgnoreCase(getCurrentUsername())) {
            throw new IllegalStateException("You cannot deactivate your own account");
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
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        String currentUser = getCurrentUsername();
        if (!Objects.equals(acc.getUsername(), currentUser) && !isAdmin()) {
            throw new IllegalStateException("You can only update your own account");
        }

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
    @PreAuthorize("hasRole('Admin')")
    public void deleteAccount(UUID accountId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        String currentUser = getCurrentUsername();
        if (currentUser != null && currentUser.equalsIgnoreCase(acc.getUsername())) {
            throw new IllegalStateException("You cannot delete your own account");
        }

        boolean hasProtectedRole = acc.getRoles().stream()
                .anyMatch(r -> "Admin".equalsIgnoreCase(r.getRoleName())
                        || "Shop Owner".equalsIgnoreCase(r.getRoleName()));
        if (hasProtectedRole) {
            throw new IllegalStateException("Cannot delete an account with Admin or Shop Owner role");
        }

        accountRepository.delete(acc);
    }


}
