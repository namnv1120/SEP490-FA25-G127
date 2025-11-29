package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PosShiftOpenRequest {
    @DecimalMin(value = "0", message = "Số tiền ban đầu không được âm")
    private BigDecimal initialCash;
    
    private List<CashDenominationRequest> cashDenominations; // Chi tiết mệnh giá tiền khi mở ca
}

