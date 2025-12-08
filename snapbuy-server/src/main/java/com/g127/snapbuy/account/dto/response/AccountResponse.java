package com.g127.snapbuy.account.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AccountResponse {
    private UUID id;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private String avatarUrl;
    private List<String> roles;
    private Boolean active;
}
