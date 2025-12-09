package com.g127.snapbuy.auth.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenBlacklistServiceImplTest {

    private TokenBlacklistServiceImpl tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistServiceImpl();
    }

    @Test
    void blacklist_Success() {
        // Given
        String jti = "test-jti-123";
        long expiresAt = System.currentTimeMillis() + 3600000; // 1 hour from now

        // When
        tokenBlacklistService.blacklist(jti, expiresAt);

        // Then
        assertTrue(tokenBlacklistService.isBlacklisted(jti));
    }

    @Test
    void isBlacklisted_NotBlacklisted_ReturnsFalse() {
        // Given
        String jti = "non-existent-jti";

        // When
        boolean result = tokenBlacklistService.isBlacklisted(jti);

        // Then
        assertFalse(result);
    }

    @Test
    void isBlacklisted_Expired_ReturnsFalse() {
        // Given
        String jti = "expired-jti";
        long expiresAt = System.currentTimeMillis() - 1000; // 1 second ago

        // When
        tokenBlacklistService.blacklist(jti, expiresAt);
        boolean result = tokenBlacklistService.isBlacklisted(jti);

        // Then
        assertFalse(result);
    }

    @Test
    void isBlacklisted_ExpiredToken_RemovesFromStore() {
        // Given
        String jti = "expired-jti";
        long expiresAt = System.currentTimeMillis() - 1000; // 1 second ago

        // When
        tokenBlacklistService.blacklist(jti, expiresAt);
        tokenBlacklistService.isBlacklisted(jti); // First call removes it
        boolean result = tokenBlacklistService.isBlacklisted(jti); // Second call should still return false

        // Then
        assertFalse(result);
    }

    @Test
    void isBlacklisted_ValidToken_ReturnsTrue() {
        // Given
        String jti = "valid-jti";
        long expiresAt = System.currentTimeMillis() + 3600000; // 1 hour from now

        // When
        tokenBlacklistService.blacklist(jti, expiresAt);
        boolean result = tokenBlacklistService.isBlacklisted(jti);

        // Then
        assertTrue(result);
    }

    @Test
    void blacklist_MultipleTokens_Success() {
        // Given
        String jti1 = "jti-1";
        String jti2 = "jti-2";
        String jti3 = "jti-3";
        long expiresAt = System.currentTimeMillis() + 3600000;

        // When
        tokenBlacklistService.blacklist(jti1, expiresAt);
        tokenBlacklistService.blacklist(jti2, expiresAt);
        tokenBlacklistService.blacklist(jti3, expiresAt);

        // Then
        assertTrue(tokenBlacklistService.isBlacklisted(jti1));
        assertTrue(tokenBlacklistService.isBlacklisted(jti2));
        assertTrue(tokenBlacklistService.isBlacklisted(jti3));
    }

    @Test
    void blacklist_SameJtiTwice_UpdatesExpiration() {
        // Given
        String jti = "same-jti";
        long firstExpiration = System.currentTimeMillis() + 1000;
        long secondExpiration = System.currentTimeMillis() + 3600000;

        // When
        tokenBlacklistService.blacklist(jti, firstExpiration);
        tokenBlacklistService.blacklist(jti, secondExpiration);

        // Then
        assertTrue(tokenBlacklistService.isBlacklisted(jti));
    }

    @Test
    void isBlacklisted_EdgeCase_ExpiresExactlyNow() throws InterruptedException {
        // Given
        String jti = "edge-case-jti";
        long expiresAt = System.currentTimeMillis() + 100; // 100ms from now

        // When
        tokenBlacklistService.blacklist(jti, expiresAt);
        Thread.sleep(150); // Wait for expiration
        boolean result = tokenBlacklistService.isBlacklisted(jti);

        // Then
        assertFalse(result);
    }
}
