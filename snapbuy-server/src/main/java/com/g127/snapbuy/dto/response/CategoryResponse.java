package com.g127.snapbuy.dto.response;

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
    private UUID parentId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

