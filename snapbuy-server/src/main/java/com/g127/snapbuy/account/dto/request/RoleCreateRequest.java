package com.g127.snapbuy.account.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class RoleCreateRequest {
    @NotBlank(message = "Vui lòng nhập tên vai trò.")
    @Size(max = 50, message = "Tên vai trò không được vượt quá 50 ký tự.")
    @Pattern(regexp = "^[\\p{L}\\d ]+$", message = "Tên vai trò chỉ cho phép chữ, số và khoảng trắng")
    private String roleName;

    private String description;

    private Boolean active;
}
