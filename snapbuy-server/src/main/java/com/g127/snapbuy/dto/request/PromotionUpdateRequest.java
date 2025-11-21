package com.g127.snapbuy.dto.request;

import com.g127.snapbuy.entity.Promotion;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(regexp = "^[\\p{L}\\d ]+$", message = "Tên khuyến mãi chỉ cho phép chữ, số và khoảng trắng")
    private String promotionName;
    private String description;
    private Promotion.DiscountType discountType;
    private BigDecimal discountValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active;
    private List<UUID> productIds;
}