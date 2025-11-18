package com.g127.snapbuy.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class AccountCreateRequest {
    @Size(min = 2, max = 100, message = "Họ và tên phải từ 2 đến 100 ký tự.")
    @Pattern(
            regexp = "^[\\p{L}\\d ]+$",
            message = "Họ và tên chỉ cho phép chữ, số và khoảng trắng"
    )
    private String fullName;

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

    @NotNull(message = "Trạng thái hoạt động không được để trống.")
    private Boolean active = true;

    private List<String> roles;
}
