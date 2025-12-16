package com.g127.snapbuy.auth.controller;

import com.g127.snapbuy.auth.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.auth.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.auth.dto.request.VerifyOtpRequest;
import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.auth.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/forgot-password")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/request")
    public ApiResponse<Void> request(@RequestBody @Valid ForgotPasswordRequest req) {
        forgotPasswordService.requestOtp(req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        return response;
    }

    @PostMapping("/verify")
    public ApiResponse<Void> verify(@RequestBody @Valid VerifyOtpRequest req) {
        forgotPasswordService.verifyOtp(req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        return response;
    }

    @PostMapping("/reset")
    public ApiResponse<Void> reset(@RequestBody @Valid ResetPasswordRequest req) {
        forgotPasswordService.resetPassword(req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        return response;
    }
}
