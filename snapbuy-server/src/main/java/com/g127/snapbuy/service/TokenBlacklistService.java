package com.g127.snapbuy.service;

public interface TokenBlacklistService {
    void blacklist(String jti, long expiresAtEpochMs);
    boolean isBlacklisted(String jti);
}