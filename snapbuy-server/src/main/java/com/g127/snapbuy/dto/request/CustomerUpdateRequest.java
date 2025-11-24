package com.g127.snapbuy.dto.request;

import com.g127.snapbuy.entity.Customer;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerUpdateRequest {

    @NotBlank(message = "Họ và tên không được để trống.")
    @Size(min = 2, max = 50, message = "Họ và tên phải từ 2 đến 50 ký tự.")
    @Pattern(regexp = "^[\\p{L}\\d ]+$", message = "Họ và tên chỉ cho phép chữ, số và khoảng trắng")
    private String fullName;

    private Customer.Gender gender;

}
