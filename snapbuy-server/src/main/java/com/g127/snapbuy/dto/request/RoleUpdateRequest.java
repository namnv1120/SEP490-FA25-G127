package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoleUpdateRequest {
    @Size(max = 50, message = "roleName phải <= 50 ký tự")
    @Pattern(regexp = "^[\\p{L}\\d ]+$", message = "Tên vai trò chỉ cho phép chữ, số và khoảng trắng")
    private String roleName;

    @Size(max = 4000)
    private String description;

    private Boolean active;
}
