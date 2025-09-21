package com.g127.snapbuy.dto;

import lombok.Data;

@Data
public class AuthenticationRequest {
    private String username;
    private String password;
}