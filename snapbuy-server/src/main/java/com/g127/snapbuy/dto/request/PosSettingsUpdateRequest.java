package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosSettingsUpdateRequest {

    @NotNull(message = "Phần trăm thuế không được để trống")
    @DecimalMin(value = "0.00", message = "Phần trăm thuế phải >= 0")
    @DecimalMax(value = "100.00", message = "Phần trăm thuế phải <= 100")
    private BigDecimal taxPercent;

    @NotNull(message = "Phần trăm chiết khấu không được để trống")
    @DecimalMin(value = "0.00", message = "Phần trăm chiết khấu phải >= 0")
    @DecimalMax(value = "100.00", message = "Phần trăm chiết khấu phải <= 100")
    private BigDecimal discountPercent;

    @NotNull(message = "Phần trăm điểm tích lũy không được để trống")
    @DecimalMin(value = "0.00", message = "Phần trăm điểm tích lũy phải >= 0")
    @DecimalMax(value = "100.00", message = "Phần trăm điểm tích lũy phải <= 100")
    private BigDecimal loyaltyPointsPercent;
}

