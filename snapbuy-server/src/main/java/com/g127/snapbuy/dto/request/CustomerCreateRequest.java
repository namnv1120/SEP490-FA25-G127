package com.g127.snapbuy.dto.request;

import com.g127.snapbuy.entity.Customer;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerCreateRequest {

    @NotBlank(message = "First name must not be empty.")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters.")
    private String firstName;

    @NotBlank(message = "Last name must not be empty.")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters.")
    private String lastName;

    @Email(message = "Email should be valid.")
    @NotBlank(message = "Email must not be empty.")
    private String email;

    @NotBlank(message = "Phone number must not be empty.")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be valid.")
    private String phone;

    @NotNull(message = "Date of birth must not be null.")
    @Past(message = "Date of birth must be in the past.")
    private LocalDate dateOfBirth;

    @NotNull(message = "Gender must not be null.")
    private Customer.Gender gender;

    @Size(max = 500, message = "Address cannot be more than 500 characters.")
    private String address;

    @Size(max = 50, message = "City name cannot be more than 50 characters.")
    private String city;

    @Size(max = 50, message = "District name cannot be more than 50 characters.")
    private String district;

    @Size(max = 50, message = "Ward name cannot be more than 50 characters.")
    private String ward;

    @Builder.Default
    private boolean active = true;
}
