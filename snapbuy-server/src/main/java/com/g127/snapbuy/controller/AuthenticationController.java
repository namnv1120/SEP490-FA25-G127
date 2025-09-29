package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.request.AuthenticationRequest;
import com.g127.snapbuy.dto.request.IntrospectRequest;
import com.g127.snapbuy.dto.request.LogoutRequest;
import com.g127.snapbuy.dto.request.RefreshRequest;
import com.g127.snapbuy.dto.response.ApiResponse;
import com.g127.snapbuy.dto.response.AuthenticationResponse;
import com.g127.snapbuy.dto.response.IntrospectResponse;
import com.g127.snapbuy.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/token")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(
            @RequestBody @Valid AuthenticationRequest req) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(authenticationService.authenticate(req)));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(
                    ApiResponse.<AuthenticationResponse>builder()
                            .code("UNAUTHENTICATED")
                            .message("Invalid username or password")
                            .result(null)
                            .build()
            );
        }
    }


    @PostMapping("/introspect")
    public ResponseEntity<ApiResponse<IntrospectResponse>> introspect(
            @RequestBody @Valid IntrospectRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authenticationService.introspect(req)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refresh(
            @RequestBody @Valid RefreshRequest req) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(authenticationService.refreshToken(req)));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(
                    ApiResponse.<AuthenticationResponse>builder()
                            .code("UNAUTHENTICATED")
                            .message("Invalid token")
                            .result(null)
                            .build()
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody LogoutRequest req) {
        try {
            authenticationService.logout(req);
            return ResponseEntity.ok(ApiResponse.ok(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.<Void>builder()
                            .code("TOKEN_REVOKED")
                            .message(e.getMessage())
                            .build()
            );
        }
    }

}
