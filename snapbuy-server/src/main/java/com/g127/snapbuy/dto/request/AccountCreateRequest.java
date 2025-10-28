package com.g127.snapbuy.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class AccountCreateRequest {
    @NotBlank(message = "Vui lòng nhập họ và tên.")
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự.")
    private String fullName;

    @NotBlank(message = "Vui lòng nhập tên đăng nhập.")
    @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự.")
    @Pattern(
            regexp = "^[A-Za-z0-9._-]+$",
            message = "Tên đăng nhập chỉ được gồm chữ, số, dấu chấm (.), gạch dưới (_) hoặc gạch ngang (-), không có khoảng trắng."
    )
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Vui lòng nhập mật khẩu.")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự.")
    private String password;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Vui lòng xác nhận mật khẩu.")
    private String confirmPassword;

    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Email không hợp lệ. Vui lòng kiểm tra lại.")
    private String email;

    @Pattern(
            regexp = "^$|^\\d{10}$",
            message = "Số điện thoại phải gồm đúng 10 chữ số."
    )
    private String phone;

    private String avatarUrl;

    private List<String> roles;
}
