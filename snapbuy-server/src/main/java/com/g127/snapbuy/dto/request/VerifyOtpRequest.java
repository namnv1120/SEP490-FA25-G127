package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Email không hợp lệ. Vui lòng kiểm tra lại.")
    private String email;

    @NotBlank(message = "Vui lòng nhập mã OTP.")
    @Pattern(regexp = "\\d{6}", message = "Mã OTP phải gồm 6 chữ số.")
    private String code;
}

