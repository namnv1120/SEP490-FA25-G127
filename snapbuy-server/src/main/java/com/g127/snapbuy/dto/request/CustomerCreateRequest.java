package com.g127.snapbuy.dto.request;

import com.g127.snapbuy.entity.Customer;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CustomerCreateRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    @Pattern(regexp = "^[\\p{L}\\s.'-]+$", message = "Full name can only contain letters, spaces, dots, apostrophes, and hyphens")
    private String fullName;

    @Email(message = "Invalid email format")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Pattern(regexp = "^(\\+?84|0)[1-9][0-9]{8,9}$", message = "Invalid Vietnamese phone number format")
    @Size(min = 10, max = 15, message = "Phone must be between 10-15 characters")
    private String phone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "District must not exceed 50 characters")
    private String district;

    @Size(max = 50, message = "Ward must not exceed 50 characters")
    private String ward;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private Customer.Gender gender;

    @NotNull(message = "Customer type is required")
    private Customer.CustomerType customerType;

    @Pattern(regexp = "^[0-9]{10}(-[0-9]{3})?$", message = "Tax code must be 10 digits or 10 digits followed by dash and 3 digits")
    @Size(max = 20, message = "Tax code must not exceed 20 characters")
    private String taxCode;

    @DecimalMin(value = "0.0", inclusive = true, message = "Credit limit must be non-negative")
    @DecimalMax(value = "999999999999.99", message = "Credit limit is too large")
    private BigDecimal creditLimit;
}
