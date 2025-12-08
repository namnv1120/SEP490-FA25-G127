package com.g127.snapbuy.auth.service.impl;

import com.g127.snapbuy.config.JwtUtil;
import com.g127.snapbuy.auth.dto.request.AuthenticationRequest;
import com.g127.snapbuy.auth.dto.request.IntrospectRequest;
import com.g127.snapbuy.auth.dto.request.LogoutRequest;
import com.g127.snapbuy.auth.dto.request.RefreshRequest;
import com.g127.snapbuy.auth.dto.response.AuthenticationResponse;
import com.g127.snapbuy.auth.dto.response.IntrospectResponse;
import com.g127.snapbuy.auth.service.AuthenticationService;
import com.g127.snapbuy.auth.service.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final com.g127.snapbuy.repository.AccountRepository accountRepository;

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest req) {
        String uname = req.getUsername().trim().toLowerCase();
        req.setUsername(uname);

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(uname, req.getPassword()));

        UserDetails user = userDetailsService.loadUserByUsername(uname);
        Integer ver = accountRepository.findByUsername(uname).map(a -> a.getTokenVersion()).orElse(0);
        String token = jwtUtil.generateToken(user, java.util.Map.of("ver", ver));
        Date expDate = null;
        try { expDate = jwtUtil.extractExpiration(token); } catch (Exception ignored) {}
        long exp = expDate != null ? expDate.getTime() : 0L;
        return AuthenticationResponse.builder().token(token).tokenType("Bearer").expiresAt(exp).build();
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest req) {
        try {
            String username = jwtUtil.extractUsername(req.getToken());
            UserDetails user = userDetailsService.loadUserByUsername(username);
            boolean valid = jwtUtil.validateToken(req.getToken(), user);
            Date expDate = null;
            try { expDate = jwtUtil.extractExpiration(req.getToken()); } catch (Exception ignored) {}
            Long exp = expDate != null ? expDate.getTime() : 0L;
            List<String> roles = user.getAuthorities().stream().map(a -> a.getAuthority()).toList();
            return IntrospectResponse.builder().valid(valid).username(username).exp(exp).roles(roles).build();
        } catch (Exception e) {
            return IntrospectResponse.builder().valid(false).error("Token không hợp lệ").build();
        }
    }

    @Override
    public AuthenticationResponse refreshToken(RefreshRequest req) {
        try {
            String username = jwtUtil.extractUsername(req.getToken());
            UserDetails user = userDetailsService.loadUserByUsername(username);
            if (!jwtUtil.validateToken(req.getToken(), user)) {
                throw new BadCredentialsException("Token không hợp lệ");
            }
            Integer ver = accountRepository.findByUsername(username).map(a -> a.getTokenVersion()).orElse(0);
            String newToken = jwtUtil.generateToken(user, java.util.Map.of("ver", ver));
            Date expDate = null;
            try { expDate = jwtUtil.extractExpiration(newToken); } catch (Exception ignored) {}
            long exp = expDate != null ? expDate.getTime() : 0L;
            return AuthenticationResponse.builder().token(newToken).tokenType("Bearer").expiresAt(exp).build();
        } catch (Exception e) {
            throw new BadCredentialsException("Token không hợp lệ");
        }
    }

    @Override
    public void logout(LogoutRequest req) {
        String raw = req.getToken();
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Thiếu token");
        }

        String token = raw.startsWith("Bearer ") ? raw.substring(7) : raw;

        String jti = jwtUtil.extractJti(token);

        if (tokenBlacklistService.isBlacklisted(jti)) {
            throw new IllegalArgumentException("Token đã bị thu hồi");
        }

        Date expDate = null;
        try { expDate = jwtUtil.extractExpiration(token); } catch (Exception ignored) {}
        long expMs = expDate != null ? expDate.getTime() : Long.MAX_VALUE;
        tokenBlacklistService.blacklist(jti, expMs);
    }
}
