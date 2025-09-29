package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.dto.request.VerifyOtpRequest;

public interface ForgotPasswordService {
    void requestOtp(ForgotPasswordRequest req);
    void verifyOtp(VerifyOtpRequest req);
    void resetPassword(ResetPasswordRequest req);
}