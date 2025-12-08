package com.g127.snapbuy.auth.service.impl;

import com.g127.snapbuy.config.JwtUtil;
import com.g127.snapbuy.auth.dto.request.AuthenticationRequest;
import com.g127.snapbuy.auth.dto.request.IntrospectRequest;
import com.g127.snapbuy.auth.dto.request.LogoutRequest;
import com.g127.snapbuy.auth.dto.request.RefreshRequest;
import com.g127.snapbuy.auth.dto.response.AuthenticationResponse;
import com.g127.snapbuy.auth.dto.response.IntrospectResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.auth.service.TokenBlacklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private AuthenticationRequest authRequest;
    private UserDetails userDetails;
    private Account testAccount;
    private String testToken;

    @BeforeEach
    void setUp() {
        authRequest = new AuthenticationRequest();
        authRequest.setUsername("testuser");
        authRequest.setPassword("password123");

        userDetails = User.builder()
                .username("testuser")
                .password("hashedPassword")
                .authorities(new SimpleGrantedAuthority("ROLE_USER"))
                .build();

        testAccount = new Account();
        testAccount.setUsername("testuser");
        testAccount.setTokenVersion(1);

        testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token";
    }

    @Test
    void authenticate_Success() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(accountRepository.findByUsername(anyString())).thenReturn(Optional.of(testAccount));
        when(jwtUtil.generateToken(any(UserDetails.class), anyMap())).thenReturn(testToken);
        when(jwtUtil.extractExpiration(anyString())).thenReturn(new Date(System.currentTimeMillis() + 3600000));

        // When
        AuthenticationResponse result = authenticationService.authenticate(authRequest);

        // Then
        assertNotNull(result);
        assertEquals(testToken, result.getToken());
        assertEquals("Bearer", result.getTokenType());
        assertTrue(result.getExpiresAt() > 0);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void authenticate_TrimsAndLowercasesUsername() {
        // Given
        authRequest.setUsername("  TestUser  ");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(userDetails);
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(jwtUtil.generateToken(any(UserDetails.class), anyMap())).thenReturn(testToken);
        when(jwtUtil.extractExpiration(anyString())).thenReturn(new Date());

        // When
        AuthenticationResponse result = authenticationService.authenticate(authRequest);

        // Then
        assertNotNull(result);
        verify(userDetailsService).loadUserByUsername("testuser");
    }

    @Test
    void authenticate_InvalidCredentials_ThrowsException() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid credentials"));

        // When & Then
        assertThrows(BadCredentialsException.class, 
            () -> authenticationService.authenticate(authRequest));
    }

    @Test
    void authenticate_AccountNotFound_UsesDefaultTokenVersion() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(accountRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(jwtUtil.generateToken(any(UserDetails.class), anyMap())).thenReturn(testToken);
        when(jwtUtil.extractExpiration(anyString())).thenReturn(new Date());

        // When
        AuthenticationResponse result = authenticationService.authenticate(authRequest);

        // Then
        assertNotNull(result);
        verify(jwtUtil).generateToken(any(UserDetails.class), argThat(map -> 
            map.containsKey("ver") && map.get("ver").equals(0)));
    }

    @Test
    void introspect_ValidToken_ReturnsValidResponse() {
        // Given
        IntrospectRequest request = new IntrospectRequest();
        request.setToken(testToken);
        
        when(jwtUtil.extractUsername(anyString())).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtUtil.validateToken(anyString(), any(UserDetails.class))).thenReturn(true);
        when(jwtUtil.extractExpiration(anyString())).thenReturn(new Date(System.currentTimeMillis() + 3600000));

        // When
        IntrospectResponse result = authenticationService.introspect(request);

        // Then
        assertNotNull(result);
        assertTrue(result.isValid());
        assertEquals("testuser", result.getUsername());
        assertNotNull(result.getRoles());
        assertTrue(result.getExp() > 0);
    }

    @Test
    void introspect_InvalidToken_ReturnsInvalidResponse() {
        // Given
        IntrospectRequest request = new IntrospectRequest();
        request.setToken("invalid.token");
        
        when(jwtUtil.extractUsername(anyString())).thenThrow(new RuntimeException("Invalid token"));

        // When
        IntrospectResponse result = authenticationService.introspect(request);

        // Then
        assertNotNull(result);
        assertFalse(result.isValid());
        assertEquals("Token không hợp lệ", result.getError());
    }

    @Test
    void introspect_ExpiredToken_ReturnsInvalidResponse() {
        // Given
        IntrospectRequest request = new IntrospectRequest();
        request.setToken(testToken);
        
        when(jwtUtil.extractUsername(anyString())).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtUtil.validateToken(anyString(), any(UserDetails.class))).thenReturn(false);
        when(jwtUtil.extractExpiration(anyString())).thenReturn(new Date(System.currentTimeMillis() - 3600000));

        // When
        IntrospectResponse result = authenticationService.introspect(request);

        // Then
        assertNotNull(result);
        assertFalse(result.isValid());
    }

    @Test
    void refreshToken_ValidToken_ReturnsNewToken() {
        // Given
        RefreshRequest request = new RefreshRequest();
        request.setToken(testToken);
        String newToken = "new.jwt.token";
        
        when(jwtUtil.extractUsername(anyString())).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtUtil.validateToken(anyString(), any(UserDetails.class))).thenReturn(true);
        when(accountRepository.findByUsername(anyString())).thenReturn(Optional.of(testAccount));
        when(jwtUtil.generateToken(any(UserDetails.class), anyMap())).thenReturn(newToken);
        when(jwtUtil.extractExpiration(anyString())).thenReturn(new Date(System.currentTimeMillis() + 3600000));

        // When
        AuthenticationResponse result = authenticationService.refreshToken(request);

        // Then
        assertNotNull(result);
        assertEquals(newToken, result.getToken());
        assertEquals("Bearer", result.getTokenType());
    }

    @Test
    void refreshToken_InvalidToken_ThrowsException() {
        // Given
        RefreshRequest request = new RefreshRequest();
        request.setToken("invalid.token");
        
        when(jwtUtil.extractUsername(anyString())).thenThrow(new RuntimeException("Invalid token"));

        // When & Then
        assertThrows(BadCredentialsException.class, 
            () -> authenticationService.refreshToken(request));
    }

    @Test
    void refreshToken_ExpiredToken_ThrowsException() {
        // Given
        RefreshRequest request = new RefreshRequest();
        request.setToken(testToken);
        
        when(jwtUtil.extractUsername(anyString())).thenReturn("testuser");
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(userDetails);
        when(jwtUtil.validateToken(anyString(), any(UserDetails.class))).thenReturn(false);

        // When & Then
        assertThrows(BadCredentialsException.class, 
            () -> authenticationService.refreshToken(request));
    }

    @Test
    void logout_ValidToken_BlacklistsToken() {
        // Given
        LogoutRequest request = new LogoutRequest();
        request.setToken(testToken);
        String jti = UUID.randomUUID().toString();
        
        when(jwtUtil.extractJti(anyString())).thenReturn(jti);
        when(tokenBlacklistService.isBlacklisted(anyString())).thenReturn(false);
        when(jwtUtil.extractExpiration(anyString())).thenReturn(new Date(System.currentTimeMillis() + 3600000));

        // When
        authenticationService.logout(request);

        // Then
        verify(tokenBlacklistService).blacklist(eq(jti), anyLong());
    }

    @Test
    void logout_WithBearerPrefix_RemovesPrefix() {
        // Given
        LogoutRequest request = new LogoutRequest();
        request.setToken("Bearer " + testToken);
        String jti = UUID.randomUUID().toString();
        
        when(jwtUtil.extractJti(anyString())).thenReturn(jti);
        when(tokenBlacklistService.isBlacklisted(anyString())).thenReturn(false);
        when(jwtUtil.extractExpiration(anyString())).thenReturn(new Date());

        // When
        authenticationService.logout(request);

        // Then
        verify(jwtUtil).extractJti(testToken);
    }

    @Test
    void logout_NullToken_ThrowsException() {
        // Given
        LogoutRequest request = new LogoutRequest();
        request.setToken(null);

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> authenticationService.logout(request));
    }

    @Test
    void logout_EmptyToken_ThrowsException() {
        // Given
        LogoutRequest request = new LogoutRequest();
        request.setToken("   ");

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> authenticationService.logout(request));
    }

    @Test
    void logout_AlreadyBlacklisted_ThrowsException() {
        // Given
        LogoutRequest request = new LogoutRequest();
        request.setToken(testToken);
        String jti = UUID.randomUUID().toString();
        
        when(jwtUtil.extractJti(anyString())).thenReturn(jti);
        when(tokenBlacklistService.isBlacklisted(anyString())).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> authenticationService.logout(request));
        verify(tokenBlacklistService, never()).blacklist(anyString(), anyLong());
    }
}
