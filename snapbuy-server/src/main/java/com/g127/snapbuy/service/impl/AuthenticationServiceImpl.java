package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.config.JwtUtil;
import com.g127.snapbuy.dto.request.AuthenticationRequest;
import com.g127.snapbuy.dto.request.IntrospectRequest;
import com.g127.snapbuy.dto.request.LogoutRequest;
import com.g127.snapbuy.dto.request.RefreshRequest;
import com.g127.snapbuy.dto.response.AuthenticationResponse;
import com.g127.snapbuy.dto.response.IntrospectResponse;
import com.g127.snapbuy.service.AuthenticationService;
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

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        UserDetails user = userDetailsService.loadUserByUsername(req.getUsername());
        String token = jwtUtil.generateToken(user);
        long exp = new Date().getTime() + 60L * 60 * 1000;
        return AuthenticationResponse.builder().token(token).tokenType("Bearer").expiresAt(exp).build();
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest req) {
        try {
            String username = jwtUtil.extractUsername(req.getToken());
            UserDetails user = userDetailsService.loadUserByUsername(username);
            boolean valid = jwtUtil.validateToken(req.getToken(), user);
            Long exp = jwtUtil.extractExpiration(req.getToken()).getTime();
            List<String> roles = user.getAuthorities().stream().map(a -> a.getAuthority()).toList();
            return IntrospectResponse.builder().valid(valid).username(username).exp(exp).roles(roles).build();
        } catch (Exception e) {
            return IntrospectResponse.builder().valid(false).error("Invalid token").build();
        }
    }

    @Override
    public AuthenticationResponse refreshToken(RefreshRequest req) {
        try {
            String username = jwtUtil.extractUsername(req.getToken());
            UserDetails user = userDetailsService.loadUserByUsername(username);
            if (!jwtUtil.validateToken(req.getToken(), user)) throw new BadCredentialsException("Invalid token");
            String newToken = jwtUtil.generateToken(user);
            long exp = new Date().getTime() + 60L * 60 * 1000;
            return AuthenticationResponse.builder().token(newToken).tokenType("Bearer").expiresAt(exp).build();
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid token");
        }
    }

    @Override
    public void logout(LogoutRequest req) {
    }
}
