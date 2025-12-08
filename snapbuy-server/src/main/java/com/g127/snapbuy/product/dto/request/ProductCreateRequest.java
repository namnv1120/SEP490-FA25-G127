package com.g127.snapbuy.product.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "Vui lòng nhập tên sản phẩm.")
    @Size(max = 200, message = "Tên sản phẩm không được vượt quá 200 ký tự.")
    @Pattern(regexp = "^[\\p{L}\\d ]+$", message = "Tên sản phẩm chỉ cho phép chữ, số và khoảng trắng")
    private String productName;

    @NotBlank(message = "Vui lòng nhập mã sản phẩm.")
    @Size(max = 50, message = "Mã sản phẩm không được vượt quá 50 ký tự.")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "Mã sản phẩm chỉ cho phép chữ, số, gạch dưới hoặc gạch ngang.")
    private String productCode;

    @Size(max = 100, message = "Barcode không được vượt quá 100 ký tự.")
    @Pattern(regexp = "^[A-Za-z0-9]*$", message = "Barcode chỉ cho phép chữ và số.")
    private String barcode;

    private String description;

    @NotBlank(message = "Vui lòng chọn danh mục.")
    private String categoryId;

    @NotBlank(message = "Vui lòng chọn nhà cung cấp.")
    private String supplierId;

    @Size(max = 20, message = "Đơn vị tính không được vượt quá 20 ký tự.")
    private String unit;

    @Size(max = 50, message = "Kích thước không được vượt quá 50 ký tự.")
    private String dimensions;

    private Boolean active;

    private MultipartFile image;
}
