package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StaffOwnerUpdateRequest {
    @Size(max = 100)
    private String fullName;

    @Email
    private String email;

    @Pattern(regexp = "^$|^\\d{10}$", message = "Số điện thoại phải gồm đúng 10 chữ số.")
    private String phone;

    private String avatarUrl;

    private Boolean active;
}
