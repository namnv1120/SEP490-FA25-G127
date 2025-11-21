package com.g127.snapbuy.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PosShiftCloseRequest {
    private BigDecimal closingCash;
    private String note;
}
