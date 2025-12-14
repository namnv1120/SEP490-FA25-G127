package com.g127.snapbuy.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MasterRoleRequest {
    
    @NotBlank(message = "Tên vai trò không được để trống")
    @Size(min = 2, max = 50, message = "Tên vai trò phải từ 2-50 ký tự")
    private String roleName;
    
    private String description;
    
    private Boolean active = true;
    
    private Integer displayOrder = 0;
}
