package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.request.AuthenticationRequest;
import com.g127.snapbuy.dto.request.IntrospectRequest;
import com.g127.snapbuy.dto.request.LogoutRequest;
import com.g127.snapbuy.dto.request.RefreshRequest;
import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.AuthenticationResponse;
import com.g127.snapbuy.dto.response.IntrospectResponse;
import com.g127.snapbuy.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest req) {
        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setResult(authenticationService.authenticate(req));
        return response;
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody @Valid IntrospectRequest req) {
        ApiResponse<IntrospectResponse> response = new ApiResponse<>();
        response.setResult(authenticationService.introspect(req));
        return response;
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refresh(@RequestBody @Valid RefreshRequest req) {
        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setResult(authenticationService.refreshToken(req));
        return response;
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest req) {
        authenticationService.logout(req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Đăng xuất thành công");
        return response;
    }
}
