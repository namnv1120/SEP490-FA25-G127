package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class StaffRoleUpdateRequest {
    @NotEmpty(message = "roles must not be empty")
    private List<String> roles;
}

