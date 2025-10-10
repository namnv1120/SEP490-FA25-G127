package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.response.*;
import com.g127.snapbuy.entity.*;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "customer.customerId", target = "customerId")
    @Mapping(source = "customer.fullName", target = "customerName", defaultValue = "Guest Customer")
    @Mapping(source = "account.accountId", target = "accountId")
    OrderResponse toBaseResponse(Order order);

    @Named("toOrderDetailResponseList")
    default List<OrderDetailResponse> toOrderDetailResponseList(List<OrderDetail> details) {
        if (details == null) return List.of();
        return details.stream()
                .map(d -> OrderDetailResponse.builder()
                        .orderDetailId(d.getOrderDetailId())
                        .productId(d.getProduct() != null ? d.getProduct().getProductId() : UUID.randomUUID())
                        .productName(d.getProduct() != null ? d.getProduct().getProductName() : "Unknown Product")
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .discount(d.getDiscount())
                        .totalPrice(calcTotal(d.getUnitPrice(), d.getQuantity(), d.getDiscount()))
                        .build())
                .collect(Collectors.toList());
    }

    @Named("toPaymentResponseList")
    default List<PaymentResponse> toPaymentResponseList(List<Payment> payments) {
        if (payments == null) return List.of();
        return payments.stream()
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
    }

    @Named("toResponse")
    default OrderResponse toResponse(Order order, List<OrderDetail> details, List<Payment> payments) {
        OrderResponse base = toBaseResponse(order);
        base.setOrderDetails(toOrderDetailResponseList(details));
        base.setPayments(toPaymentResponseList(payments));
        return base;
    }

    default BigDecimal calcTotal(BigDecimal unitPrice, Integer quantity, BigDecimal discount) {
        if (unitPrice == null || quantity == null) return BigDecimal.ZERO;
        BigDecimal disc = (discount != null) ? discount : BigDecimal.ZERO;
        return unitPrice
                .multiply(BigDecimal.valueOf(quantity))
                .multiply(BigDecimal.ONE.subtract(disc.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP)));
    }
}
