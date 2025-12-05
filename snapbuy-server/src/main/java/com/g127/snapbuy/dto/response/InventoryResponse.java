package com.g127.snapbuy.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private UUID inventoryId;
    private UUID productId;
    private String productCode;
    private String productName;
    private Integer quantityInStock;
    private Integer minimumStock;
    private Integer maximumStock;
    private Integer reorderPoint;
    private LocalDateTime lastUpdated;
}
