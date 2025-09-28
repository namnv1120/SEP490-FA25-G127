package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.dto.request.VerifyOtpRequest;
import com.g127.snapbuy.dto.response.ApiResponse;
import com.g127.snapbuy.service.ForgotPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/forgot-password")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Void>> request(@RequestBody @Valid ForgotPasswordRequest req) {
        forgotPasswordService.requestOtp(req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verify(@RequestBody @Valid VerifyOtpRequest req) {
        forgotPasswordService.verifyOtp(req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Void>> reset(@RequestBody @Valid ResetPasswordRequest req) {
        forgotPasswordService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
