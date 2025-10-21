package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "Product name must not be empty")
    @Size(max = 200, message = "Product name must be at most 200 characters")
    private String productName;

    @NotBlank(message = "Product code must not be empty")
    @Size(max = 50, message = "Product code must be at most 50 characters")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "Product code can only contain letters, numbers, underscores or dashes")
    private String productCode;

    @Size(max = 10000, message = "Description must be at most 10000 characters")
    private String description;

    @NotNull(message = "Category ID must not be null")
    private UUID categoryId;

    private UUID supplierId;

    @Size(max = 20, message = "Unit must be at most 20 characters")
    private String unit;

    @Size(max = 50, message = "Dimensions must be at most 50 characters")
    private String dimensions;

    @Size(max = 500, message = "Image URL must be at most 500 characters")
    @URL(message = "Invalid image URL format")
    private String imageUrl;

    private Boolean active;
}
