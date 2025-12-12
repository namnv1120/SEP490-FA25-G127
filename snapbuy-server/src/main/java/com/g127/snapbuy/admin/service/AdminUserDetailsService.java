package com.g127.snapbuy.admin.service;

import com.g127.snapbuy.admin.entity.AdminAccount;
import com.g127.snapbuy.admin.repository.AdminAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserDetailsService implements UserDetailsService {
    
    private final AdminAccountRepository adminAccountRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminAccount admin = adminAccountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + username));
        
        if (!admin.getIsActive()) {
            throw new UsernameNotFoundException("Admin account is disabled");
        }
        
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_ADMIN");
        
        return User.builder()
                .username(admin.getUsername())
                .password(admin.getPasswordHash())
                .authorities(Collections.singleton(authority))
                .accountLocked(!admin.getIsActive())
                .build();
    }
}
