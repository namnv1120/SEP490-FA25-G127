package com.g127.snapbuy.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterRoleResponse {
    
    private UUID roleId;
    private String roleName;
    private String description;
    private Boolean active;
    private Date createdDate;
    private Boolean isSystemRole;
    private Integer displayOrder;
    private Integer userCount; // Số lượng user có role này (tổng tất cả tenants)
}
