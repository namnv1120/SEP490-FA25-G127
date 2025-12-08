package com.g127.snapbuy.auth.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AuthenticationRequest {
    @NotBlank(message = "Vui lòng nhập tên đăng nhập.")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự.")
    @Pattern(
            regexp = "^[A-Za-z0-9._-]+$",
            message = "Tên đăng nhập chỉ được gồm chữ, số, dấu chấm (.), gạch dưới (_) hoặc gạch ngang (-), không có khoảng trắng."
    )
    private String username;

    @NotBlank(message = "Vui lòng nhập mật khẩu.")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự.")
    private String password;
}
