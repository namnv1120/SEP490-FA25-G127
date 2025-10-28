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

    @Size(min = 2, max = 50, message = "Họ và tên phải từ 2 đến 50 ký tự.")
    private String fullName;

    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự.")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Số điện thoại không đúng định dạng.")
    private String phone;

    @NotNull(message = "Vui lòng chọn giới tính.")
    private Customer.Gender gender;

    @AssertTrue(message = "Trạng thái khách hàng phải là hoạt động hoặc không hoạt động.")
    private boolean active = true;
}
