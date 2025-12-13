package com.g127.snapbuy.promotion.dto.response;

import com.g127.snapbuy.promotion.entity.Promotion;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionResponse {
    private UUID promotionId;
    private String promotionName;
    private String description;
    private Promotion.DiscountType discountType;
    private BigDecimal discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active;
    private LocalDateTime createdDate;

    private List<UUID> productIds;
}
