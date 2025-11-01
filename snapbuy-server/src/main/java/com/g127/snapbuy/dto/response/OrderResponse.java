package com.g127.snapbuy.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private UUID orderId;
    private String orderNumber;
    private UUID customerId;
    private String customerName;
    private UUID accountId;
    private String createdBy;
    private LocalDateTime orderDate;
    private String orderStatus;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private String notes;
    private List<OrderDetailResponse> orderDetails;
    private PaymentResponse payment;
    //Gia goc
    private BigDecimal subtotal;
}
