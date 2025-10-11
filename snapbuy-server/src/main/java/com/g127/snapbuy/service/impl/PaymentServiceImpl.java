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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        BigDecimal orderTotal = order.getTotalAmount();
        BigDecimal paymentAmount = request.getAmount();

        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than 0");
        }

        if (paymentAmount.compareTo(orderTotal) < 0) {
            throw new IllegalArgumentException("Payment amount is less than the total order amount");
        }

        Payment payment = new Payment();
        payment.setPaymentId(UUID.randomUUID());
        payment.setOrder(order);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(paymentAmount);
        payment.setPaymentStatus("SUCCESS");
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
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return paymentRepository.findByOrder(order).stream()
                .map(p -> PaymentResponse.builder()
                        .paymentId(p.getPaymentId())
                        .paymentMethod(p.getPaymentMethod())
                        .amount(p.getAmount())
                        .paymentStatus(p.getPaymentStatus())
                        .transactionReference(p.getTransactionReference())
                        .notes(p.getNotes())
                        .paymentDate(p.getPaymentDate())
                        .build())
                .toList();
    }
}
