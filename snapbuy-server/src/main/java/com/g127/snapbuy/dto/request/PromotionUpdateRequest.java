package com.g127.snapbuy.dto.request;

import com.g127.snapbuy.entity.Promotion;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionUpdateRequest {
    @Size(max = 200, message = "Tên khuyến mãi không được vượt quá 200 ký tự")
    private String promotionName;
    private String description;
    private Promotion.DiscountType discountType;
    private BigDecimal discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active;
    private List<UUID> productIds;
}