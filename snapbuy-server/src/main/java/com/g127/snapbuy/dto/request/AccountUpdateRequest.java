package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class AccountUpdateRequest {
    @Size(max = 100, message = "Họ và tên không được vượt quá 100 ký tự.")
    private String fullName;

    @Email(message = "Email không hợp lệ. Vui lòng kiểm tra lại.")
    private String email;

    @Pattern(regexp = "^$|^\\d{10}$", message = "Số điện thoại phải gồm đúng 10 chữ số.")
    private String phone;

    private String avatarUrl;

    private MultipartFile avatar;

    private Boolean removeAvatar;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự.")
    private String password;

    private Boolean active;

    private List<String> roles;
}
