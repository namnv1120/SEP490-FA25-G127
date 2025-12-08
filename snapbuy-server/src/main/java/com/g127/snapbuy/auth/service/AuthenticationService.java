package com.g127.snapbuy.auth.service;

import com.g127.snapbuy.auth.dto.request.AuthenticationRequest;
import com.g127.snapbuy.auth.dto.request.IntrospectRequest;
import com.g127.snapbuy.auth.dto.request.LogoutRequest;
import com.g127.snapbuy.auth.dto.request.RefreshRequest;
import com.g127.snapbuy.auth.dto.response.AuthenticationResponse;
import com.g127.snapbuy.auth.dto.response.IntrospectResponse;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    IntrospectResponse introspect(IntrospectRequest request);

    AuthenticationResponse refreshToken(RefreshRequest request);

    void logout(LogoutRequest request);
}
