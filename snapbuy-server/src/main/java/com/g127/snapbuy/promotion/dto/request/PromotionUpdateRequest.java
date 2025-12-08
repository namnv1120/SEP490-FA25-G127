package com.g127.snapbuy.promotion.dto.request;

import com.g127.snapbuy.entity.Promotion;
import jakarta.validation.constraints.DecimalMin;
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
    @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9\\-% ]+$", message = "Tên khuyến mãi chỉ được chứa chữ, số, dấu -, % và khoảng trắng")
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