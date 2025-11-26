package com.g127.snapbuy.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PosShiftCloseRequest {
    private BigDecimal closingCash;
    private String note;
    private List<CashDenominationRequest> cashDenominations;
}
