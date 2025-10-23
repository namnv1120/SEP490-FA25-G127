package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.util.UUID;

@Data
public class ProductImportRequest {

    @NotBlank(message = "Product name must not be empty")
    private String productName;

    @NotBlank(message = "Product code must not be empty")
    private String productCode;


    private String description;

    @NotNull(message = "Category must not be null")
    private String categoryName;

    @NotNull(message = "Supplier ID must not be null")
    private String supplierName;

    private String unit;

    private String dimensions;

    @Size(max = 500, message = "Image URL must be at most 500 characters")
    @URL(message = "Invalid image URL format")
    private String imageUrl;
}
