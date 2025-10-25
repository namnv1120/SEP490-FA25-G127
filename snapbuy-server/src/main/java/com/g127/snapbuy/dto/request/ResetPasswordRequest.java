package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Email không hợp lệ. Vui lòng kiểm tra lại.")
    private String email;

    @NotBlank(message = "Vui lòng nhập mã OTP.")
    private String code;

    @NotBlank(message = "Vui lòng nhập mật khẩu mới.")
    @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự.")
    private String newPassword;

    @NotBlank(message = "Vui lòng xác nhận mật khẩu mới.")
    private String confirmNewPassword;
}
