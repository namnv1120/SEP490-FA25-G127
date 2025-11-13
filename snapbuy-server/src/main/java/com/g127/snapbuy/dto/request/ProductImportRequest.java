package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import java.util.UUID;

@Data
public class ProductImportRequest {

    @NotBlank(message = "Mã sản phẩm không được để trống")
    @Length(min = 3, max = 10, message = "Mã sản phẩm phải từ 3 đến 10 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Mã sản phẩm chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang")
    private String productCode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Length(min = 3, max = 100, message = "Tên sản phẩm phải từ 3 đến 100 ký tự")
    private String productName;

    private String description;

    @NotBlank(message = "Tên danh mục không được để trống")
    private String categoryName;

    private String subCategoryName;

    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    @Length(min = 3, max = 10, message = "Mã nhà cung cấp phải từ 3 đến 10 ký tự")
    @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "Mã nhà cung cấp chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang")
    private String supplierCode;

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Length(min = 3, max = 100, message = "Tên nhà cung cấp phải từ 3 đến 100 ký tự")
    private String supplierName;

    @Length(max = 10, message = "Đơn vị không được quá 10 ký tự")
    private String unit;
    
    @Length(max = 30, message = "Kích thước không được quá 30 ký tự")
    private String dimensions;

    @Length(max = 50, message = "Barcode không được quá 50 ký tự")
    @Pattern(regexp = "^$|^[a-zA-Z0-9]*$", message = "Barcode chỉ được chứa chữ và số")
    private String barcode;

}
