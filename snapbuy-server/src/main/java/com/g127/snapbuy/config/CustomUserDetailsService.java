package com.g127.snapbuy.config;

import com.g127.snapbuy.entity.User;
import com.g127.snapbuy.entity.UserRole;
import com.g127.snapbuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = userRepository.findWithRolesByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        var authorities = (u.getUserRoles()==null ? java.util.List.<String>of()
                : u.getUserRoles().stream()
                .map(UserRole::getRole)
                .map(r -> r.getRoleName())
                .collect(Collectors.toList()));

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getUsername())
                .password(u.getPassword())
                .authorities(authorities.toArray(String[]::new))
                .build();
    }
}