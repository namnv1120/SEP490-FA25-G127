package com.g127.snapbuy.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAccountResponse {
    private UUID accountId;
    private String fullName;
    private String email;
    private String phone;
    private String roleName;
    private String tenantId;
    private String tenantName;
    private Boolean active;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
}
