package com.g127.snapbuy.order.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequest {
    @Pattern(regexp = "^$|^\\d{10}$", message = "Số điện thoại phải gồm đúng 10 chữ số.")
    private String phone;

    private String notes;

    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm.")
    private List<OrderDetailRequest> items;

    private BigDecimal discountAmount;

    private BigDecimal taxAmount;

    private String paymentMethod;

    private Integer usePoints;
}
