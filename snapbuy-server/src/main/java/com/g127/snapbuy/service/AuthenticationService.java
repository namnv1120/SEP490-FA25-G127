package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.AuthenticationRequest;
import com.g127.snapbuy.dto.request.IntrospectRequest;
import com.g127.snapbuy.dto.request.LogoutRequest;
import com.g127.snapbuy.dto.request.RefreshRequest;
import com.g127.snapbuy.dto.response.AuthenticationResponse;
import com.g127.snapbuy.dto.response.IntrospectResponse;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    IntrospectResponse introspect(IntrospectRequest request);

    AuthenticationResponse refreshToken(RefreshRequest request);

    void logout(LogoutRequest request);
}
