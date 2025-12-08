package com.g127.snapbuy.product.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class CategoryResponse {

    private UUID categoryId;
    private String categoryName;
    private String description;
    private UUID parentCategoryId;
    private Boolean active;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

