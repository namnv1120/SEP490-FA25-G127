package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.response.OrderDetailResponse;
import com.g127.snapbuy.dto.response.OrderResponse;
import com.g127.snapbuy.dto.response.PaymentResponse;
import com.g127.snapbuy.entity.Order;
import com.g127.snapbuy.entity.OrderDetail;
import com.g127.snapbuy.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

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

    @Named("toPaymentResponse")
    default PaymentResponse toPaymentResponse(Payment payment) {
        if (payment == null) return null;
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus())
                .transactionReference(payment.getTransactionReference())
                .notes(payment.getNotes())
                .paymentDate(payment.getPaymentDate())
                .build();
    }

    @Named("toResponse")
    default OrderResponse toResponse(Order order, List<OrderDetail> details, Payment payment) {
        OrderResponse base = toBaseResponse(order);
        base.setOrderDetails(toOrderDetailResponseList(details));
        base.setPayment(toPaymentResponse(payment));
        return base;
    }

    default BigDecimal calcTotal(BigDecimal unitPrice, Integer quantity, BigDecimal discount) {
        if (unitPrice == null || quantity == null) return BigDecimal.ZERO;
        BigDecimal disc = (discount != null) ? discount : BigDecimal.ZERO;
        return unitPrice
                .multiply(BigDecimal.valueOf(quantity))
                .multiply(BigDecimal.ONE.subtract(
                        disc.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP)
                ));
    }
}
