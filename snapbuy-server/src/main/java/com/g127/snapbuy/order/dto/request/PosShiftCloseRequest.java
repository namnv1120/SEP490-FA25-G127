package com.g127.snapbuy.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PosShiftCloseRequest {

    @NotNull(message = "Số tiền cuối ca không được để trống")
    @DecimalMin(value = "0", message = "Số tiền cuối ca không được âm")
    private BigDecimal closingCash;
    
    private String note; // Không giới hạn ký tự
    
    @Valid
    private List<CashDenominationRequest> cashDenominations;
}
