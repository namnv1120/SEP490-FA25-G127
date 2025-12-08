package com.g127.snapbuy.auth.controller;

import com.g127.snapbuy.auth.dto.request.AuthenticationRequest;
import com.g127.snapbuy.auth.dto.request.IntrospectRequest;
import com.g127.snapbuy.auth.dto.request.LogoutRequest;
import com.g127.snapbuy.auth.dto.request.RefreshRequest;
import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.auth.dto.response.AuthenticationResponse;
import com.g127.snapbuy.auth.dto.response.IntrospectResponse;
import com.g127.snapbuy.auth.service.AuthenticationService;
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
    public ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest req) {
        authenticationService.logout(req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Đăng xuất thành công");
        return response;
    }
}
