package com.g127.snapbuy.dto;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String code;
}
