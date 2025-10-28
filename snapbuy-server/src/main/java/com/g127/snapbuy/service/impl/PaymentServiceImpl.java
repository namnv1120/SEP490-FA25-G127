package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.PaymentRequest;
import com.g127.snapbuy.dto.response.PaymentResponse;
import com.g127.snapbuy.entity.Order;
import com.g127.snapbuy.entity.Payment;
import com.g127.snapbuy.repository.OrderRepository;
import com.g127.snapbuy.repository.PaymentRepository;
import com.g127.snapbuy.service.MoMoService;
import com.g127.snapbuy.service.PaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final MoMoService moMoService;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền thanh toán không hợp lệ");
        }

        Payment payment = new Payment();
        payment.setPaymentId(UUID.randomUUID());
        payment.setOrder(order);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(amount);
        payment.setPaymentStatus("Chưa thanh toán");
        payment.setPaymentDate(LocalDateTime.now());

        if ("MOMO".equalsIgnoreCase(request.getPaymentMethod()) || "Ví điện tử".equalsIgnoreCase(request.getPaymentMethod())) {
            try {
                var momoResp = moMoService.createPayment(order.getOrderId());
                if (momoResp != null && momoResp.getPayUrl() != null) {
                    payment.setTransactionReference(momoResp.getRequestId());
                    payment.setNotes("PAYURL:" + momoResp.getPayUrl());
                }
            } catch (Exception e) {
                log.error("Tạo thanh toán MoMo thất bại: {}", e.getMessage(), e);
                payment.setNotes("Lỗi MoMo: " + e.getMessage());
            }
        }

        paymentRepository.save(payment);
        order.setPaymentStatus("Chưa thanh toán");
        orderRepository.save(order);
        return toResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse finalizePayment(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán"));

        payment.setPaymentStatus("Đã thanh toán");
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaymentStatus("Đã thanh toán");
        order.setOrderStatus("Hoàn tất");
        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);
        return toResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse refundPayment(UUID id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán"));
        payment.setPaymentStatus("Đã hoàn tiền");
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaymentStatus("Đã hoàn tiền");
        order.setOrderStatus("Hoàn tất");
        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);
        return toResponse(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        Payment payment = paymentRepository.findByOrder(order);
        if (payment == null) return List.of();
        return List.of(toResponse(payment));
    }

    @Override
    @Transactional
    public void finalizePaymentByReference(String momoRequestId) {
        Payment payment = paymentRepository.findByTransactionReference(momoRequestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán theo requestId MoMo"));

        payment.setPaymentStatus("Đã thanh toán");
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaymentStatus("Đã thanh toán");
        order.setOrderStatus("Hoàn tất");
        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);

        log.info("Xác nhận thanh toán MoMo cho đơn {}", order.getOrderNumber());
    }

    private PaymentResponse toResponse(Payment payment) {
        String payUrl = null;
        if (payment.getNotes() != null && payment.getNotes().startsWith("PAYURL:")) {
            payUrl = payment.getNotes().substring("PAYURL:".length());
        }
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus())
                .transactionReference(payment.getTransactionReference())
                .notes(payment.getNotes())
                .paymentDate(payment.getPaymentDate())
                .payUrl(payUrl)
                .build();
    }
}
