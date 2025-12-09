package com.g127.snapbuy.customer.dto.request;

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

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự.")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Số điện thoại không đúng định dạng.")
    private String phone;

    private Customer.Gender gender;

}
