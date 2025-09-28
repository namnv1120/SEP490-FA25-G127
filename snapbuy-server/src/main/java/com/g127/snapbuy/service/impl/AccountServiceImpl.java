package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.AccountCreateRequest;
import com.g127.snapbuy.dto.request.AccountUpdateRequest;
import com.g127.snapbuy.dto.request.ChangePasswordRequest;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final AccountMapper accountMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse createAccount(AccountCreateRequest req) {
        return createWithSingleRole(req, "Shop Owner");
    }

    @Override
    public AccountResponse getMyInfo() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));
        return accountMapper.toResponse(acc);
    }

    @Override
    @PostAuthorize("returnObject.username == authentication.name")
    public AccountResponse updateAccount(UUID accountId, AccountUpdateRequest req) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        accountMapper.updateAccount(acc, req);
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            acc.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }

        return accountMapper.toResponse(accountRepository.save(acc));
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public void deleteAccount(UUID accountId) {
        accountRepository.deleteById(accountId);
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public List<AccountResponse> getAccounts() {
        log.info("Fetching all accounts");
        return accountRepository.findAll().stream().map(accountMapper::toResponse).toList();
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse getAccount(UUID id) {
        return accountMapper.toResponse(
                accountRepository.findById(id)
                        .orElseThrow(() -> new NoSuchElementException("Account not found"))
        );
    }

    @Override
    public AccountResponse changePassword(UUID accountId, ChangePasswordRequest req) {
        if (req.getNewPassword() == null || req.getConfirmNewPassword() == null
                || !req.getNewPassword().equals(req.getConfirmNewPassword())) {
            throw new IllegalArgumentException("Confirm new password does not match");
        }
        if (req.getOldPassword() != null && req.getOldPassword().equals(req.getNewPassword())) {
            throw new IllegalArgumentException("New password must be different from old password");
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
        if (req.getNewPassword() == null || req.getConfirmNewPassword() == null
                || !req.getNewPassword().equals(req.getConfirmNewPassword())) {
            throw new IllegalArgumentException("Confirm new password does not match");
        }
        if (req.getOldPassword() != null && req.getOldPassword().equals(req.getNewPassword())) {
            throw new IllegalArgumentException("New password must be different from old password");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
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

        acc.getRoles().add(role);
        accountRepository.save(acc);

        return accountMapper.toResponse(acc);
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse createShopOwner(AccountCreateRequest req) {
        return createWithSingleRole(req, "Shop Owner");
    }

    @Override
    @PreAuthorize("hasRole('Shop Owner')")
    public AccountResponse createStaff(AccountCreateRequest req) {
        String requested = (req.getRoles() != null && !req.getRoles().isEmpty()) ? req.getRoles().get(0) : null;
        if (!"Warehouse Staff".equalsIgnoreCase(requested) && !"Sales Staff".equalsIgnoreCase(requested)) {
            throw new IllegalArgumentException("Role must be Warehouse Staff or Sales Staff");
        }
        return createWithSingleRole(req, requested);
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

        Account account = accountMapper.toEntity(req);
        if (account.getAccountId() == null) account.setAccountId(UUID.randomUUID());
        account.setUsername(username);
        account.setFullName(req.getFullName());
        account.setPasswordHash(passwordEncoder.encode(req.getPassword()));

        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new NoSuchElementException("Role not found: " + roleName));
        account.getRoles().clear();
        account.getRoles().add(role);

        try {
            account = accountRepository.save(account);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Duplicate or invalid data");
        }
        return accountMapper.toResponse(account);
    }
}
