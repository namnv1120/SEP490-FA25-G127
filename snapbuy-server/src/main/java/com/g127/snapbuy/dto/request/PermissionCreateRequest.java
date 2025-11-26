package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PermissionCreateRequest {
    @NotBlank(message = "Vui lòng nhập tên quyền.")
    @Size(max = 50, message = "Tên quyền không được vượt quá 50 ký tự.")
    private String permissionName;

    private String description;

    @Size(max = 50, message = "Module không được vượt quá 50 ký tự.")
    private String module;

    private Boolean isActive;
}
