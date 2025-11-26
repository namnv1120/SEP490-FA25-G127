package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CashDenominationRequest {
    @NotNull(message = "Mệnh giá không được để trống")
    @Min(value = 500, message = "Mệnh giá tối thiểu là 500")
    private Integer denomination;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 0, message = "Số lượng không được âm")
    private Integer quantity;
}

