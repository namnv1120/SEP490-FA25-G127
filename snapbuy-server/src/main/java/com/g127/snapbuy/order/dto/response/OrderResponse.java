package com.g127.snapbuy.order.dto.response;

import com.g127.snapbuy.account.dto.response.AccountResponse;
import com.g127.snapbuy.payment.dto.response.PaymentResponse;
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
    private String accountName;
    private AccountResponse account;
    private LocalDateTime orderDate;
    private LocalDateTime updatedDate;
    private String orderStatus;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private String notes;
    private List<OrderDetailResponse> orderDetails;
    private PaymentResponse payment;
    private BigDecimal subtotal;
    private Integer pointsRedeemed;
    private Integer pointsEarned;
}
