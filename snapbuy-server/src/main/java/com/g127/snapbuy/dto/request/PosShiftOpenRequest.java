package com.g127.snapbuy.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PosShiftOpenRequest {
    private BigDecimal initialCash;
}

