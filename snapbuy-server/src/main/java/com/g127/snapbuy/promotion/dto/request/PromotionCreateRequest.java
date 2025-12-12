package com.g127.snapbuy.promotion.dto.request;

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

    @NotBlank(message = "Tên khuyến mãi không được để trống")
    @Pattern(regexp = "^[\\p{L}\\p{N}\\s%\\-$]+$", message = "Tên khuyến mãi chỉ được chứa chữ, số, khoảng trắng và các ký tự: %, -, $")
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
    @Size(min = 1, message = "Phải chọn ít nhất 1 sản phẩm để áp dụng khuyến mãi")
    private List<UUID> productIds;
}
