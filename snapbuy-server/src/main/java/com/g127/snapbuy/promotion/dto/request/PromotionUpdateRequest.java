package com.g127.snapbuy.promotion.dto.request;

import com.g127.snapbuy.entity.Promotion;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s%\\-$]+$", message = "Tên khuyến mãi chỉ được chứa chữ, số, khoảng trắng và các ký tự: %, -, $")
    private String promotionName;
    private String description;
    private Promotion.DiscountType discountType;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá trị giảm giá phải lớn hơn 0")
    private BigDecimal discountValue;
    
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean active;
    private List<UUID> productIds;
}