package com.g127.snapbuy.config;

import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Account acc = accountRepository
                .findByUsernameWithRolesAndPermissions(username)   // <— dùng fetch-join
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Spring Security dùng chuẩn ROLE_xxx cho hasRole("xxx")
        String[] authorities = acc.getRoles().stream()
                .map(r -> {
                    String roleName = r.getRoleName();
                    return roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
                })
                .toArray(String[]::new);

        return org.springframework.security.core.userdetails.User
                .withUsername(acc.getUsername())
                .password(acc.getPasswordHash())
                .authorities(authorities)
                .accountLocked(Boolean.FALSE.equals(acc.getIsActive()))
                .disabled(Boolean.FALSE.equals(acc.getIsActive()))
                .build();
    }
}
