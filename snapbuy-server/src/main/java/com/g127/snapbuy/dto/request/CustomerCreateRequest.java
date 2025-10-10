package com.g127.snapbuy.dto.request;

import com.g127.snapbuy.entity.Customer;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerCreateRequest {

    @Size(min = 2, max = 50, message = "Full name must be between 2 and 50 characters.")
    private String fullname;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be valid.")
    private String phone;

    @NotNull(message = "Gender must not be null.")
    private Customer.Gender gender;

    @Builder.Default
    private boolean active = true;
}
