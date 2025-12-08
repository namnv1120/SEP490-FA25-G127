package com.g127.snapbuy.auth.service;

import com.g127.snapbuy.auth.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.auth.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.auth.dto.request.VerifyOtpRequest;

public interface ForgotPasswordService {
    void requestOtp(ForgotPasswordRequest req);

    void verifyOtp(VerifyOtpRequest req);

    void resetPassword(ResetPasswordRequest req);
}