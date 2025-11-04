package com.g127.snapbuy.dto.request;

import com.g127.snapbuy.entity.Promotion;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionCreateRequest {

    @NotBlank
    private String promotionName;

    private String description;

    @NotNull
    private Promotion.DiscountType discountType;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal discountValue;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    @NotNull
    @Size(min = 1)
    private List<UUID> productIds;
}




