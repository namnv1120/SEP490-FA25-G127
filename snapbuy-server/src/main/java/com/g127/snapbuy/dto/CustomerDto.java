package com.g127.snapbuy.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDto {
    private UUID customerId;

    @NotBlank(message = "Customer code is required")
    @Size(max = 20, message = "Customer code must not exceed 20 characters")
    private String customerCode;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Pattern(regexp = "^[0-9]{9,15}$", message = "Phone must be between 9 and 15 digits")
    private String phone;

    private String address;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "District must not exceed 50 characters")
    private String district;

    @Size(max = 50, message = "Ward must not exceed 50 characters")
    private String ward;

    @PastOrPresent(message = "Date of birth must be in the past or today")
    private LocalDate dateOfBirth;

    @Pattern(regexp = "Male|Female|Other", message = "Gender must be Male, Female or Other")
    private String gender;

    @Pattern(regexp = "Individual|Business", message = "Customer type must be Individual or Business")
    private String customerType;

    @Size(max = 20, message = "Tax code must not exceed 20 characters")
    private String taxCode;

    @DecimalMin(value = "0.0", inclusive = true, message = "Credit limit must be greater or equal to 0")
    @Digits(integer = 15, fraction = 2, message = "Credit limit format is invalid")
    private BigDecimal creditLimit;

    @Pattern(regexp = "Active|Inactive", message = "Status must be Active or Inactive")
    private String status;
}
