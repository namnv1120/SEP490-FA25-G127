package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class CategoryCreateRequest {

    @NotBlank(message = "Category name cannot be empty.")
    @Size(min = 3, max = 100, message = "Category name must be between 3 and 100 characters.")
    private String categoryName;

    @Size(max = 1000, message = "Description must not exceed 1000 characters.")
    private String description;

    private UUID parentCategoryId;

    @NotNull(message = "Active status cannot be null.")
    private Boolean active = true;
}

