package com.g127.snapbuy.admin.controller;

import com.g127.snapbuy.admin.dto.AdminLoginRequest;
import com.g127.snapbuy.admin.repository.AdminAccountRepository;
import com.g127.snapbuy.admin.service.AdminUserDetailsService;
import com.g127.snapbuy.auth.dto.response.AuthenticationResponse;
import com.g127.snapbuy.common.config.JwtUtil;
import com.g127.snapbuy.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {
    
    private final AdminUserDetailsService adminUserDetailsService;
    private final AdminAccountRepository adminAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        try {
            // Get admin account
            var admin = adminAccountRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("Sai tên đăng nhập hoặc mật khẩu"));
            
            // Verify password manually
            if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
                throw new BadCredentialsException("Sai tên đăng nhập hoặc mật khẩu");
            }
            
            // Check if account is active
            if (!admin.getIsActive()) {
                throw new BadCredentialsException("Tài khoản đã bị khóa");
            }
            
            // Load user details
            UserDetails userDetails = adminUserDetailsService.loadUserByUsername(request.getUsername());
            
            // Generate token with admin role
            Map<String, Object> claims = new HashMap<>();
            claims.put("role", "ADMIN");
            claims.put("type", "admin"); // Distinguish from tenant users
            
            String token = jwtUtil.generateToken(userDetails, claims);
            
            AuthenticationResponse authResponse = AuthenticationResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresAt(System.currentTimeMillis() + 2592000000L) // 30 days
                    .build();
            
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
            response.setResult(authResponse);
            response.setMessage("Đăng nhập thành công với tài khoản: " + admin.getFullName());
            return response;
            
        } catch (Exception e) {
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
            response.setCode(4001);
            response.setMessage("Sai tên đăng nhập hoặc mật khẩu");
            return response;
        }
    }
}
