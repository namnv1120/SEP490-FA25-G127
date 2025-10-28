package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.validator.constraints.URL;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "Vui lòng nhập tên sản phẩm.")
    @Size(max = 200, message = "Tên sản phẩm không được vượt quá 200 ký tự.")
    private String productName;

    @NotBlank(message = "Vui lòng nhập mã sản phẩm.")
    @Size(max = 50, message = "Mã sản phẩm không được vượt quá 50 ký tự.")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "Mã sản phẩm chỉ cho phép chữ, số, gạch dưới hoặc gạch ngang.")
    private String productCode;

    @Size(max = 10000, message = "Mô tả không được vượt quá 10000 ký tự.")
    private String description;

    @NotNull(message = "Vui lòng chọn danh mục.")
    private UUID categoryId;

    @NotNull(message = "Vui lòng chọn danh mục.")
    private UUID supplierId;

    @Size(max = 20, message = "Đơn vị tính không được vượt quá 20 ký tự.")
    private String unit;

    @Size(max = 50, message = "Kích thước không được vượt quá 50 ký tự.")
    private String dimensions;

    @Size(max = 500, message = "URL ảnh không được vượt quá 500 ký tự.")
    @URL(message = "URL ảnh không đúng định dạng. Vui lòng kiểm tra lại.")
    private String imageUrl;

    private Boolean active;
}
