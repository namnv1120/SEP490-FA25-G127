package com.g127.snapbuy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RoleResponse {
    private String id;
    private String roleName;
    private String description;
    private Boolean isActive;
    private String createdDate;
    private List<PermissionResponse> permissions;
}
