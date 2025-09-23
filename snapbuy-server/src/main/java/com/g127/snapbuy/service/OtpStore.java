package com.g127.snapbuy.service;

import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Lưu OTP trong bộ nhớ với TTL.
 */
@Component
public class OtpStore {

    public static class OtpRecord {
        public final String code;
        public final OffsetDateTime expiresAt;
        public int attempts;            // đếm số lần nhập
        public OffsetDateTime lastSent; // chống spam gửi lại

        public OtpRecord(String code, OffsetDateTime expiresAt, OffsetDateTime lastSent) {
            this.code = code;
            this.expiresAt = expiresAt;
            this.lastSent = lastSent;
            this.attempts = 0;
        }
    }

    // key = email (lowercase)
    private final Map<String, OtpRecord> store = new ConcurrentHashMap<>();

    public void put(String email, String code, OffsetDateTime expiresAt) {
        store.put(normalize(email), new OtpRecord(code, expiresAt, OffsetDateTime.now()));
    }

    public OtpRecord get(String email) {
        var rec = store.get(normalize(email));
        if (rec == null) return null;
        // auto-expire
        if (OffsetDateTime.now().isAfter(rec.expiresAt)) {
            store.remove(normalize(email));
            return null;
        }
        return rec;
    }

    public void remove(String email) {
        store.remove(normalize(email));
    }

    public boolean canResend(String email, int secondsGap) {
        var rec = store.get(normalize(email));
        if (rec == null) return true;
        return rec.lastSent.plusSeconds(secondsGap).isBefore(OffsetDateTime.now());
    }

    public void markResent(String email) {
        var rec = store.get(normalize(email));
        if (rec != null) rec.lastSent = OffsetDateTime.now();
    }

    private String normalize(String email) {
        return Objects.requireNonNull(email).trim().toLowerCase();
    }
}
