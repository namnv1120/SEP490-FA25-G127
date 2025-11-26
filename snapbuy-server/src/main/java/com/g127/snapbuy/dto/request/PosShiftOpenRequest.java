package com.g127.snapbuy.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PosShiftOpenRequest {
    private BigDecimal initialCash;
    private List<CashDenominationRequest> cashDenominations; // Chi tiết mệnh giá tiền khi mở ca
}

