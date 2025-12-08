package com.g127.snapbuy.order.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CashDenominationResponse {
    private String id;
    private Integer denomination;
    private Integer quantity;
    private BigDecimal totalValue;
}

