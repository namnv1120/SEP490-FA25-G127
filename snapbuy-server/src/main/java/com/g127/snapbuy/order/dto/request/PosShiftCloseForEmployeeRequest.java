package com.g127.snapbuy.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class PosShiftCloseForEmployeeRequest {
    @NotNull(message = "ID nhân viên không được để trống")
    private UUID employeeAccountId;

    @NotNull(message = "Số tiền cuối ca không được để trống")
    @DecimalMin(value = "0", message = "Số tiền cuối ca không được âm")
    private BigDecimal closingCash;

    private String note; // Không giới hạn ký tự

    @Valid
    private List<CashDenominationRequest> cashDenominations; // Chi tiết mệnh giá tiền khi đóng ca
}

