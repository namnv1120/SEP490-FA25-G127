package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.dto.request.VerifyOtpRequest;
import com.g127.snapbuy.dto.response.ApiResponse;
import com.g127.snapbuy.service.ForgotPasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/forgot-password")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Void>> request(@RequestBody ForgotPasswordRequest req) {
        forgotPasswordService.requestOtp(req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verify(@RequestBody VerifyOtpRequest req) {
        forgotPasswordService.verifyOtp(req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Void>> reset(@RequestBody ResetPasswordRequest req) {
        forgotPasswordService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
