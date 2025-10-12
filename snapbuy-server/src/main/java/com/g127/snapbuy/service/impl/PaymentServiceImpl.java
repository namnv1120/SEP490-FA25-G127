package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.PaymentRequest;
import com.g127.snapbuy.dto.response.PaymentResponse;
import com.g127.snapbuy.entity.Order;
import com.g127.snapbuy.entity.Payment;
import com.g127.snapbuy.repository.OrderRepository;
import com.g127.snapbuy.repository.PaymentRepository;
import com.g127.snapbuy.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        Payment payment = paymentRepository.findByOrder(order);
        if (payment == null) {
            throw new NoSuchElementException("Payment not found for this order");
        }

        String curr = String.valueOf(order.getPaymentStatus());
        if ("PAID".equalsIgnoreCase(curr) || "REFUNDED".equalsIgnoreCase(curr)) {
            throw new IllegalStateException("This order cannot be paid in its current status");
        }

        BigDecimal orderTotal = order.getTotalAmount();
        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than 0");
        }
        if (amount.compareTo(orderTotal) < 0) {
            throw new IllegalArgumentException("Payment amount is less than the total order amount");
        }

        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(amount);
        payment.setPaymentStatus("PAID");
        payment.setTransactionReference(request.getTransactionReference());
        payment.setNotes(request.getNotes());
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setPaymentStatus("PAID");
        order.setOrderStatus("COMPLETED");
        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);

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

    @Override
    public List<PaymentResponse> getPaymentsByOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        Payment p = paymentRepository.findByOrder(order);
        if (p == null) return List.of();

        return List.of(
                PaymentResponse.builder()
                        .paymentId(p.getPaymentId())
                        .paymentMethod(p.getPaymentMethod())
                        .amount(p.getAmount())
                        .paymentStatus(p.getPaymentStatus())
                        .transactionReference(p.getTransactionReference())
                        .notes(p.getNotes())
                        .paymentDate(p.getPaymentDate())
                        .build()
        );
    }
}
