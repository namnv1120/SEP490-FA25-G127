package com.g127.snapbuy.dto.request;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String code;
    private String newPassword;
}