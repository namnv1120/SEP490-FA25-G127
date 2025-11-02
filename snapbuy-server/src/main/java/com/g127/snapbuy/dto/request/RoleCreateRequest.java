package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class RoleCreateRequest {
    @NotBlank(message = "Vui lòng nhập tên vai trò.")
    @Size(max = 50, message = "Tên vai trò không được vượt quá 50 ký tự.")
    private String roleName;

    @Size(max = 4000, message = "Mô tả quá dài (tối đa 4000 ký tự).")
    private String description;

    private Boolean active;
}
