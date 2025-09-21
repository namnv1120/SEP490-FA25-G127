package com.g127.snapbuy.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {
    private String token;
    private String tokenType;
    private long expiresAt;
}