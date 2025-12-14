package com.g127.snapbuy.product.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {

    @Size(max = 200, message = "Tên sản phẩm không được vượt quá 200 ký tự.")
    @Pattern(regexp = "^[\\p{L}\\d ]+$", message = "Tên sản phẩm chỉ cho phép chữ, số và khoảng trắng")
    private String productName;

    @Size(min = 3, max = 10, message = "Mã sản phẩm phải từ 3 đến 10 ký tự.")
    @Pattern(regexp = "^[A-Za-z0-9_.\\-]*$", message = "Mã sản phẩm chỉ cho phép chữ, số, gạch dưới, gạch ngang hoặc dấu chấm.")
    private String productCode;

    @Size(max = 100, message = "Barcode không được vượt quá 100 ký tự.")
    @Pattern(regexp = "^[A-Za-z0-9]*$", message = "Barcode chỉ cho phép chữ và số.")
    private String barcode;

    @Size(max = 10000, message = "Mô tả không được vượt quá 10000 ký tự.")
    private String description;

    @NotNull(message = "Vui lòng chọn danh mục.")
    private UUID categoryId;

    @NotNull(message = "Vui lòng chọn nhà cung cấp.")
    private UUID supplierId;

    @Size(max = 20, message = "Đơn vị tính không được vượt quá 20 ký tự.")
    private String unit;

    @Size(max = 50, message = "Kích thước không được vượt quá 50 ký tự.")
    private String dimensions;

    private Boolean active = true;

    private MultipartFile image;

    private Boolean removeImage = false;
}
