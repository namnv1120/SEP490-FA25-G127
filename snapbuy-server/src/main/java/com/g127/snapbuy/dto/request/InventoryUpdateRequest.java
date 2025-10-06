package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class InventoryUpdateRequest {

    @Min(value = 0, message = "Quantity must be greater than or equal to 0")
    private Integer quantityInStock;

    @Min(value = 0, message = "Minimum stock must be greater than or equal to 0")
    private Integer minimumStock;

    @Min(value = 0, message = "Maximum stock must be greater than or equal to 0")
    private Integer maximumStock;

    @Min(value = 0, message = "Reorder point must be greater than or equal to 0")
    private Integer reorderPoint;
}
