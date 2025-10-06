package com.g127.snapbuy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID productId;
    private String productName;
    private String productCode;
    private String description;
    private UUID categoryId;
    private String categoryName;
    private UUID supplierId;
    private String supplierName;
    private String unit;
    private BigDecimal weight;
    private String dimensions;
    private String imageUrl;
    private Boolean active;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
