package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.AccountDto;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.Role;
import com.g127.snapbuy.exception.ResourceNotFoundException;
import com.g127.snapbuy.mapper.AccountMapper;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.RoleRepository;
import com.g127.snapbuy.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
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
    public AccountDto createAccount(AccountDto dto) {
        if (dto.getPassword() == null || !dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("PASSWORD_MISMATCH");
        }

        Account account = accountMapper.toEntity(dto);
        if (account.getAccountId() == null) {
            account.setAccountId(UUID.randomUUID());
        }
        account.setFullName(dto.getFullName());
        account.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        try {
            account = accountRepository.save(account);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("ACCOUNT_EXISTED");
        }

        Role defaultRole = roleRepository.findByRoleName("Sales Staff")
                .orElseThrow(() -> new ResourceNotFoundException("Default role not found"));
        account.getRoles().add(defaultRole);
        accountRepository.save(account);

        return accountMapper.toDto(account);
    }



    @Override
    public AccountDto getMyInfo() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        return accountMapper.toDto(acc);
    }

    @Override
    @PostAuthorize("returnObject.username == authentication.name")
    public AccountDto updateAccount(UUID accountId, AccountDto dto) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (dto.getEmail() != null) acc.setEmail(dto.getEmail());
        if (dto.getPhone() != null) acc.setPhone(dto.getPhone());
        if (dto.getAvatarUrl() != null) acc.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getPassword() != null && !dto.getPassword().isBlank())
            acc.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        acc = accountRepository.save(acc);
        return accountMapper.toDto(acc);
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public void deleteAccount(UUID accountId) {
        accountRepository.deleteById(accountId);
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public List<AccountDto> getAccounts() {
        log.info("Fetching all accounts");
        return accountRepository.findAll().stream().map(accountMapper::toDto).toList();
    }

    @Override
    @PreAuthorize("hasRole('Admin')")
    public AccountDto getAccount(UUID id) {
        return accountMapper.toDto(
                accountRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Account not found"))
        );
    }

    @Override
    public AccountDto changePassword(UUID accountId, String oldPassword, String newPassword) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!passwordEncoder.matches(oldPassword, acc.getPasswordHash()))
            throw new IllegalStateException("Old password is incorrect");

        acc.setPasswordHash(passwordEncoder.encode(newPassword));
        return accountMapper.toDto(accountRepository.save(acc));
    }

    @Override
    public void changePasswordForCurrentUser(String oldPassword, String newPassword) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account acc = accountRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        if (!passwordEncoder.matches(oldPassword, acc.getPasswordHash())) {
            throw new IllegalStateException("Old password is incorrect");
        }
        acc.setPasswordHash(passwordEncoder.encode(newPassword));
        accountRepository.save(acc);
    }


    @Override
    public AccountDto assignRole(UUID accountId, UUID roleId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        acc.getRoles().add(role);
        accountRepository.save(acc);

        return accountMapper.toDto(acc);
    }
}
