package com.g127.snapbuy.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PosShiftOpenRequest {

    @NotNull(message = "Số tiền ban đầu không được để trống")
    @DecimalMin(value = "0", message = "Số tiền ban đầu không được âm")
    private BigDecimal initialCash;
    
    @Valid
    private List<CashDenominationRequest> cashDenominations; // Chi tiết mệnh giá tiền khi mở ca
}

