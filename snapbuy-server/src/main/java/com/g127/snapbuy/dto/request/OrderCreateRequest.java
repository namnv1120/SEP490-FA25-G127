package com.g127.snapbuy.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequest {

    private UUID customerId;

    @NotNull(message = "Vui lòng chọn tài khoản tạo đơn.")
    private UUID accountId;

    private String notes;

    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm.")
    private List<OrderDetailRequest> items;

    private BigDecimal discountAmount;

    private BigDecimal taxAmount;

    private String paymentMethod;
}
