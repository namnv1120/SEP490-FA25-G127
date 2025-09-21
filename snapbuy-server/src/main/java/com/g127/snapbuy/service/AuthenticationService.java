package com.g127.snapbuy.service;
import com.g127.snapbuy.dto.*;
public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);
    IntrospectResponse     introspect(IntrospectRequest request);
    AuthenticationResponse refreshToken(RefreshRequest request);
    void                   logout(LogoutRequest request);
}
