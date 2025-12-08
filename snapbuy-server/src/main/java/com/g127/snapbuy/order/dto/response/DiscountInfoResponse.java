package com.g127.snapbuy.order.dto.response;

import com.g127.snapbuy.entity.Promotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountInfoResponse {
    private Promotion.DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountPercent;
}

