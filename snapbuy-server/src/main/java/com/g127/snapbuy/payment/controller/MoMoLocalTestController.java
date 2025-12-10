package com.g127.snapbuy.payment.controller;

import com.g127.snapbuy.entity.Order;
import com.g127.snapbuy.entity.Payment;
import com.g127.snapbuy.repository.OrderRepository;
import com.g127.snapbuy.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
@Slf4j
public class MoMoLocalTestController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Value("${momo.target:dev}")
    private String momoTarget;

    @PostMapping("/local-notify")
    public ResponseEntity<Map<String, Object>> handleLocalNotify(@RequestBody Map<String, Object> payload) {

        try {
            String momoOrderId = (String) payload.get("orderId");
            Integer resultCode = payload.get("resultCode") != null 
                ? ((Number) payload.get("resultCode")).intValue() 
                : 0;
            String transId = payload.get("transId") != null 
                ? payload.get("transId").toString() 
                : "LOCAL-TEST-" + System.currentTimeMillis();

            if (momoOrderId == null || momoOrderId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "orderId is required"
                ));
            }

            String orderNumber = momoOrderId.substring(0, momoOrderId.lastIndexOf("-"));

            List<Order> allOrders = orderRepository.findAll();
            Order order = allOrders.stream()
                    .filter(o -> orderNumber.equals(o.getOrderNumber()))
                    .findFirst()
                    .orElse(null);

            if (order == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Order not found: " + orderNumber
                ));
            }

            Payment payment = paymentRepository.findByOrder(order);
            if (payment == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Payment not found for order"
                ));
            }

            if ("Đã thanh toán".equals(order.getPaymentStatus())) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Order already completed",
                        "orderId", order.getOrderId().toString(),
                        "orderNumber", order.getOrderNumber()
                ));
            }

            // Kiểm tra nếu đơn đã bị hủy, từ chối thanh toán
            if ("Đã hủy".equals(order.getOrderStatus())) {
                log.warn("❌ Rejected MoMo payment for cancelled order: {}", order.getOrderNumber());
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "Cannot process payment: Order has been cancelled",
                        "orderId", order.getOrderId().toString(),
                        "orderNumber", order.getOrderNumber(),
                        "orderStatus", order.getOrderStatus()
                ));
            }

            if (resultCode == 0) {
                payment.setPaymentStatus("Đã thanh toán");
                payment.setTransactionReference(transId);
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment);

                order.setOrderStatus("Hoàn tất");
                order.setPaymentStatus("Đã thanh toán");
                order.setUpdatedDate(LocalDateTime.now());
                orderRepository.save(order);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Payment processed successfully",
                        "orderId", order.getOrderId().toString(),
                        "orderNumber", order.getOrderNumber(),
                        "orderStatus", order.getOrderStatus(),
                        "paymentStatus", order.getPaymentStatus()
                ));
            } else {
                payment.setPaymentStatus("Thất bại");
                paymentRepository.save(payment);

                order.setOrderStatus("Đã hủy");
                order.setPaymentStatus("Chưa thanh toán");
                order.setUpdatedDate(LocalDateTime.now());
                orderRepository.save(order);

                return ResponseEntity.ok(Map.of(
                        "success", true, // Still return success=true because update was successful
                        "message", "Payment failed with resultCode: " + resultCode,
                        "orderId", order.getOrderId().toString(),
                        "orderNumber", order.getOrderNumber(),
                        "orderStatus", order.getOrderStatus(),
                        "paymentStatus", order.getPaymentStatus()
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Error: " + e.getMessage()
            ));
        }
    }
}
