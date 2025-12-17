package com.g127.snapbuy.supplier.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierUpdateRequest {
    @NotBlank(message = "Vui lòng nhập mã nhà cung cấp.")
    @Size(max = 20, message = "Mã nhà cung cấp không được vượt quá 20 ký tự.")
    private String supplierCode;

    @NotBlank(message = "Vui lòng nhập tên nhà cung cấp.")
    @Size(max = 100, message = "Tên nhà cung cấp không được vượt quá 100 ký tự.")
    @Pattern(regexp = "^[\\p{L}\\d ]+$", message = "Tên nhà cung cấp chỉ cho phép chữ, số và khoảng trắng")
    private String supplierName;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự.")
    @Pattern(regexp = "^$|^\\+?[0-9]{10,15}$", message = "Số điện thoại không đúng định dạng.")
    private String phone;

    @Pattern(regexp = "^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "Email không đúng định dạng. Vui lòng kiểm tra lại.")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự.")
    private String email;

    @Size(max = 100, message = "Địa chỉ không được vượt quá 100 ký tự.")
    private String address;

    @Size(max = 50, message = "Thành phố không được vượt quá 50 ký tự.")
    private String city;

    @Size(max = 50, message = "Phường/Xã không được vượt quá 50 ký tự.")
    private String ward;

    private boolean active = true;
}
