package com.g127.snapbuy.account.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoleResponse {
    private String id;
    private String roleName;
    private String description;
    private Boolean active;
    private String createdDate;
}
