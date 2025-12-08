package com.g127.snapbuy.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.g127.snapbuy.auth.service.TokenBlacklistService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final com.g127.snapbuy.repository.AccountRepository accountRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtAuthenticationFilter(JwtUtil jwtUtil,
                                   UserDetailsService userDetailsService,
                                   TokenBlacklistService tokenBlacklistService,
                                   com.g127.snapbuy.repository.AccountRepository accountRepository) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.accountRepository = accountRepository;
    }

    private void sendErrorResponse(HttpServletResponse response, String code, String message) throws IOException {
        response.setStatus(401);
        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("code", code);
        errorResponse.put("message", message);
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();
        if (path.startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        try {
            String jti = jwtUtil.extractJti(jwt);
            if (tokenBlacklistService.isBlacklisted(jti)) {
                sendErrorResponse(response, "TOKEN_REVOKED", "Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại");
                return;
            }
        } catch (ExpiredJwtException e) {
            sendErrorResponse(response, "TOKEN_EXPIRED", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
            return;
        } catch (MalformedJwtException | SignatureException e) {
            sendErrorResponse(response, "TOKEN_INVALID", "Token không hợp lệ. Vui lòng đăng nhập lại");
            return;
        } catch (Exception e) {
            sendErrorResponse(response, "UNAUTHENTICATED", "Xác thực thất bại. Vui lòng đăng nhập lại");
            return;
        }

        String username = jwtUtil.extractUsername(jwt);
        Integer ver = jwtUtil.extractVersion(jwt);
        if (username != null && ver != null) {
            var accOpt = accountRepository.findByUsername(username);
            if (accOpt.isPresent()) {
                Integer currentVer = accOpt.get().getTokenVersion();
                if (currentVer != null && !currentVer.equals(ver)) {
                    sendErrorResponse(response, "TOKEN_REVOKED", "Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại");
                    return;
                }
            }
        }
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(jwt, userDetails)) {
                var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                sendErrorResponse(response, "TOKEN_EXPIRED", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
