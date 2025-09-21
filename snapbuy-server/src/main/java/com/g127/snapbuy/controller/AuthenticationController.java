package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.*;
import com.g127.snapbuy.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.AuthenticationException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/token")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(
            @RequestBody AuthenticationRequest req) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(authenticationService.authenticate(req)));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body(
                    ApiResponse.<AuthenticationResponse>builder()
                            .code("UNAUTHENTICATED")
                            .message("Authentication failed")
                            .result(null)
                            .build()
            );
        }
    }

    @PostMapping("/introspect")
    public ResponseEntity<ApiResponse<IntrospectResponse>> introspect(
            @RequestBody IntrospectRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authenticationService.introspect(req)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refresh(
            @RequestBody RefreshRequest req) {
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
        authenticationService.logout(req);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
