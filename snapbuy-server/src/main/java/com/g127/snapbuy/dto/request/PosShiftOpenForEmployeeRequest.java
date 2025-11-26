package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class PosShiftOpenForEmployeeRequest {
    @NotNull(message = "ID nhân viên không được để trống")
    private UUID employeeAccountId;

    @NotNull(message = "Số tiền ban đầu không được để trống")
    @Min(value = 0, message = "Số tiền ban đầu không được âm")
    private BigDecimal initialCash;

    private List<CashDenominationRequest> cashDenominations; // Chi tiết mệnh giá tiền khi mở ca
}

