package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.request.AuthenticationRequest;
import com.g127.snapbuy.dto.request.IntrospectRequest;
import com.g127.snapbuy.dto.request.LogoutRequest;
import com.g127.snapbuy.dto.request.RefreshRequest;
import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.AuthenticationResponse;
import com.g127.snapbuy.dto.response.IntrospectResponse;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/token")
    public ApiResponse<AuthenticationResponse> authenticate(
            @RequestBody @Valid AuthenticationRequest req) {
        try {
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
            response.setResult(authenticationService.authenticate(req));
            return response;
        } catch (Exception e) {
            throw new AppException(ErrorCode.AUTH_INVALID);
        }
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(
            @RequestBody @Valid IntrospectRequest req) {
        ApiResponse<IntrospectResponse> response = new ApiResponse<>();
        response.setResult(authenticationService.introspect(req));
        return response;
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refresh(
            @RequestBody @Valid RefreshRequest req) {
        try {
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
            response.setResult(authenticationService.refreshToken(req));
            return response;
        } catch (Exception e) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest req) {
        try {
            authenticationService.logout(req);
            ApiResponse<Void> response = new ApiResponse<>();
            response.setCode(1000);
            response.setResult(null);
            return response;
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.TOKEN_REVOKED);
        }
    }
}
