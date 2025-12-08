package com.g127.snapbuy.auth.service;

public interface TokenBlacklistService {
    void blacklist(String jti, long expiresAtEpochMs);
    boolean isBlacklisted(String jti);
}