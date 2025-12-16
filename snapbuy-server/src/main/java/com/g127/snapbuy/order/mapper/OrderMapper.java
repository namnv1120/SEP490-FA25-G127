package com.g127.snapbuy.order.mapper;

import com.g127.snapbuy.account.dto.response.AccountResponse;
import com.g127.snapbuy.account.mapper.AccountMapper;
import com.g127.snapbuy.order.dto.response.OrderDetailResponse;
import com.g127.snapbuy.order.dto.response.OrderResponse;
import com.g127.snapbuy.payment.dto.response.PaymentResponse;
import com.g127.snapbuy.order.entity.Order;
import com.g127.snapbuy.order.entity.OrderDetail;
import com.g127.snapbuy.payment.entity.Payment;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {AccountMapper.class})
public interface OrderMapper {

    @Mapping(source = "customer.customerId", target = "customerId")
    @Mapping(source = "customer.fullName", target = "customerName", defaultValue = "Guest Customer")
    @Mapping(source = "account.accountId", target = "accountId")
    @Mapping(source = "updatedDate", target = "updatedDate")
    @Mapping(target = "accountName", expression = "java(order.getAccount() != null ? (order.getAccount().getFullName() != null ? order.getAccount().getFullName() : order.getAccount().getUsername()) : null)")
    @Mapping(target = "account", expression = "java(mapAccount(order, accountMapper))")
    OrderResponse toBaseResponse(Order order, @Context AccountMapper accountMapper);

    default AccountResponse mapAccount(Order order, @Context AccountMapper accountMapper) {
        if (order == null || order.getAccount() == null) {
            return null;
        }
        return accountMapper.toResponse(order.getAccount());
    }

    @Named("toOrderDetailResponseList")
    default List<OrderDetailResponse> toOrderDetailResponseList(List<OrderDetail> details) {
        if (details == null) return List.of();
        return details.stream()
                .map(d -> OrderDetailResponse.builder()
                        .orderDetailId(d.getOrderDetailId())
                        .productId(d.getProduct() != null ? d.getProduct().getProductId() : UUID.randomUUID())
                        .productName(d.getProduct() != null ? d.getProduct().getProductName() : "Unknown Product")
                        .categoryName(d.getProduct() != null && d.getProduct().getCategory() != null ? d.getProduct().getCategory().getCategoryName() : "Khác")
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
    default OrderResponse toResponse(Order order, List<OrderDetail> details, Payment payment, @Context AccountMapper accountMapper) {
        OrderResponse base = toBaseResponse(order, accountMapper);
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
                        disc.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
                ));
    }
}
