package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.response.*;
import com.g127.snapbuy.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order, List<OrderDetail> details, List<Payment> payments) {
        List<OrderDetailResponse> detailResponses = details.stream()
                .map(d -> OrderDetailResponse.builder()
                        .orderDetailId(d.getOrderDetailId())
                        .productId(d.getProduct().getProductId())
                        .productName(d.getProduct().getProductName())
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .discount(d.getDiscount())
                        .totalPrice(d.getUnitPrice()
                                .multiply(java.math.BigDecimal.valueOf(d.getQuantity()))
                                .multiply(java.math.BigDecimal.ONE.subtract(d.getDiscount().divide(java.math.BigDecimal.valueOf(100)))))
                        .build())
                .collect(Collectors.toList());

        List<PaymentResponse> paymentResponses = payments.stream()
                .map(p -> PaymentResponse.builder()
                        .paymentId(p.getPaymentId())
                        .paymentMethod(p.getPaymentMethod())
                        .amount(p.getAmount())
                        .paymentStatus(p.getPaymentStatus())
                        .transactionReference(p.getTransactionReference())
                        .notes(p.getNotes())
                        .paymentDate(p.getPaymentDate())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer() != null ? order.getCustomer().getCustomerId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : "Guest Customer")
                .accountId(order.getAccount().getAccountId())
                .createdBy(order.getCreatedBy())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .taxAmount(order.getTaxAmount())
                .notes(order.getNotes())
                .orderDetails(detailResponses)
                .payments(paymentResponses)
                .build();
    }
}
