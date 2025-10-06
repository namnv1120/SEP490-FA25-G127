package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceCreateRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit price must be greater than 0")
    private BigDecimal unitPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Cost price must not be negative")
    private BigDecimal costPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Tax rate cannot be negative")
    @DecimalMax(value = "100.0", message = "Tax rate cannot exceed 100")
    private BigDecimal taxRate;

    private LocalDateTime validFrom;
    private LocalDateTime validTo;
}
