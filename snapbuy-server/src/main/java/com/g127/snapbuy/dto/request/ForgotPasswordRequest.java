package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Email không hợp lệ. Vui lòng kiểm tra lại.")
    private String email;
}
