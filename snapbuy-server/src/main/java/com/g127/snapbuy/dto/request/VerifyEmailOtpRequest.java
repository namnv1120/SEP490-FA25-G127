package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyEmailOtpRequest {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String newEmail;
    
    @NotBlank(message = "Mã xác nhận không được để trống")
    @Pattern(regexp = "^\\d{6}$", message = "Mã xác nhận phải là 6 chữ số")
    private String code;
}

