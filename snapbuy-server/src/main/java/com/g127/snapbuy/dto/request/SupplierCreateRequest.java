package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierCreateRequest {
    @NotBlank(message = "Supplier code is required")
    @Size(max = 20, message = "Supplier code must be at most 20 characters")
    private String supplierCode;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 100, message = "Supplier name must be at most 100 characters")
    private String supplierName;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    @Pattern(regexp = "^[0-9+\\-()\\s]{6,20}$", message = "Invalid phone number format")
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be at most 100 characters")
    private String email;

    @Size(max = 100, message = "Address must be at most 100 characters")
    private String address;

    @Size(max = 50, message = "City must be at most 50 characters")
    private String city;

    @Size(max = 50, message = "Ward must be at most 50 characters")
    private String ward;

    @Builder.Default
    private boolean active = true;
}
