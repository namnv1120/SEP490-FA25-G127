package com.g127.snapbuy.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PermissionResponse {
    private String id;
    private String name;
    private String description;
    private String module;
    private Boolean active;
}
