package com.g127.snapbuy.auth.service;

import com.g127.snapbuy.auth.dto.request.VerifyEmailOtpRequest;

import java.util.UUID;

public interface EmailVerificationService {
    void requestOtp(UUID accountId, String newEmail);
    void verifyOtp(UUID accountId, VerifyEmailOtpRequest req);
}
