package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AccountUpdateRequest {
    @Size(max = 100, message = "Full name must be <= 100 characters")
    private String fullName;

    @Email(message = "Email is invalid")
    private String email;

    @Pattern(regexp = "^$|^\\d{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    private String avatarUrl;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private Boolean active;
}
