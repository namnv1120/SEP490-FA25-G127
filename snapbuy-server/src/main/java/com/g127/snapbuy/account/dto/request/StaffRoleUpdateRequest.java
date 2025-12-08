package com.g127.snapbuy.account.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class StaffRoleUpdateRequest {
    @NotEmpty(message = "Vai trò không được để trống")
    private List<String> roles;
}

