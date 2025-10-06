package com.g127.snapbuy.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class AccountCreateRequest {
    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be <= 100 characters")
    private String fullName;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3–50 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9._-]+$",
            message = "Username may only contain letters, digits, '.', '_' or '-' and no spaces"
    )
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    @NotBlank(message = "Email is required")
    @Email(message = "Email is invalid")
    private String email;

    @Pattern(
            regexp = "^$|^\\d{10}$",
            message = "Phone must be exactly 10 digits"
    )
    private String phone;
    private String avatarUrl;
    private List<String> roles;
}
