package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.service.TokenBlacklistService;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

    private final Map<String, Long> store = new ConcurrentHashMap<>();

    @Override
    public void blacklist(String jti, long expiresAtEpochMs) {
        store.put(jti, expiresAtEpochMs);
    }

    @Override
    public boolean isBlacklisted(String jti) {
        Long exp = store.get(jti);
        if (exp == null) return false;
        if (exp < System.currentTimeMillis()) {
            store.remove(jti);
            return false;
        }
        return true;
    }
}
