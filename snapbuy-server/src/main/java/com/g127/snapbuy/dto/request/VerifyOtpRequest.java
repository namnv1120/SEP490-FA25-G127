package com.g127.snapbuy.dto.request;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String code;
}
