package com.g127.snapbuy.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerDto {

    String id;

    @NotBlank(message = "Tên không được để trống")
    @Size(min = 2, max = 50, message = "Tên phải có từ 2 đến 50 ký tự")
    @Pattern(
            regexp = "^[\\p{L} .'-]+$",
            message = "Tên chỉ được chứa chữ cái, khoảng trắng và ký tự hợp lệ"
    )
    String name;

    @NotBlank(message = "Email không được để trống")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Email không hợp lệ (vd: abc@gmail.com)"
    )
    String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
            regexp = "^(0[0-9]{9,10})$",
            message = "Số điện thoại phải bắt đầu bằng 0 và có 10-11 chữ số"
    )
    String phone;

    @Size(max = 200, message = "Địa chỉ tối đa 200 ký tự")
    @Pattern(
            regexp = "^[\\p{L}0-9 ,.-/]*$",
            message = "Địa chỉ chỉ được chứa chữ cái, số và ký tự ,.-/"
    )
    String address;
}
