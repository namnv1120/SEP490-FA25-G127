package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class CategoryUpdateRequest {

    @Size(min = 3, max = 100, message = "Tên danh mục phải từ 3 đến 100 ký tự.")
    @Pattern(regexp = "^[\\p{L}\\d ]+$", message = "Tên danh mục chỉ cho phép chữ, số và khoảng trắng")
    private String categoryName;

    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự.")
    private String description;

    private UUID parentCategoryId;

    @NotNull(message = "Trạng thái hoạt động không được để trống.")
    private Boolean active = true;

}
