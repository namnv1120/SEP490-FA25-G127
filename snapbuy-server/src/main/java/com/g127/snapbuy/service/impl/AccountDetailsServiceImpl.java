package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.service.AccountDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AccountDetailsServiceImpl implements AccountDetailsService {

    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String uname = username == null ? null : username.trim().toLowerCase();

        Account acc = accountRepository
                .findByUsernameWithRolesAndPermissionsIgnoreCase(uname)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        String[] authorities = acc.getRoles().stream()
                .map(r -> r.getRoleName().startsWith("ROLE_") ? r.getRoleName() : "ROLE_" + r.getRoleName())
                .toArray(String[]::new);

        boolean enabled = Boolean.TRUE.equals(acc.getIsActive());
        return User.withUsername(acc.getUsername())
                .password(acc.getPasswordHash())
                .authorities(authorities)
                .accountLocked(!enabled)
                .disabled(!enabled)
                .build();
    }
}
