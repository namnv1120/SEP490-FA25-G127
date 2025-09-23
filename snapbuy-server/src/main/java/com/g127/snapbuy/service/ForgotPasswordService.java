package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.*;

public interface ForgotPasswordService {
    void requestOtp(ForgotPasswordRequest req);
    void verifyOtp(VerifyOtpRequest req);
    void resetPassword(ResetPasswordRequest req);
}