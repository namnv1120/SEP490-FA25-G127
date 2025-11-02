package com.g127.snapbuy.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AccountResponse {
    private String id;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private String avatarUrl;
    private List<String> roles;
    private Boolean active;
}
