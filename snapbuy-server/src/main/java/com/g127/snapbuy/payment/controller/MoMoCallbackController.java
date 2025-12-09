package com.g127.snapbuy.payment.controller;

import com.g127.snapbuy.entity.Order;
import com.g127.snapbuy.entity.Payment;
import com.g127.snapbuy.repository.OrderRepository;
import com.g127.snapbuy.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
@Slf4j
public class MoMoCallbackController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Value("${momo.dev.secretKey}")
    private String devSecretKey;

    @Value("${momo.prod.secretKey}")
    private String prodSecretKey;

    @Value("${momo.target:dev}")
    private String momoTarget;

    @PostMapping("/notify")
    public ResponseEntity<Map<String, Object>> handleNotify(@RequestBody Map<String, Object> payload) {
        try {
            String partnerCode = (String) payload.get("partnerCode");
            String orderId = (String) payload.get("orderId"); // This is momoOrderId
            String requestId = (String) payload.get("requestId");
            Long amount = ((Number) payload.get("amount")).longValue();
            String orderInfo = (String) payload.get("orderInfo");
            String orderType = (String) payload.get("orderType");
            String transId = payload.get("transId") != null ? payload.get("transId").toString() : null;
            Integer resultCode = ((Number) payload.get("resultCode")).intValue();
            String message = (String) payload.get("message");
            String payType = (String) payload.get("payType");
            Long responseTime = payload.get("responseTime") != null ? ((Number) payload.get("responseTime")).longValue() : null;
            String extraData = (String) payload.get("extraData");
            String signature = (String) payload.get("signature");

            String secretKey = "dev".equals(momoTarget) ? devSecretKey : prodSecretKey;
            String rawHash = "accessKey=" + payload.get("accessKey")
                    + "&amount=" + amount
                    + "&extraData=" + (extraData != null ? extraData : "")
                    + "&message=" + message
                    + "&orderId=" + orderId
                    + "&orderInfo=" + orderInfo
                    + "&orderType=" + orderType
                    + "&partnerCode=" + partnerCode
                    + "&payType=" + payType
                    + "&requestId=" + requestId
                    + "&responseTime=" + responseTime
                    + "&resultCode=" + resultCode
                    + "&transId=" + (transId != null ? transId : "");

            String calculatedSignature = signHmacSHA256(rawHash, secretKey);

            if (!calculatedSignature.equals(signature)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "message", "Invalid signature",
                        "resultCode", 99
                ));
            }

            String orderNumber = orderId.substring(0, orderId.lastIndexOf("-"));

            List<Order> allOrders = orderRepository.findAll();
            Order order = allOrders.stream()
                    .filter(o -> orderNumber.equals(o.getOrderNumber()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

            Payment payment = paymentRepository.findByOrder(order);
            if (payment == null) {
                throw new RuntimeException("Payment not found for order: " + orderNumber);
            }
            
            if (resultCode == 0) {
                payment.setPaymentStatus("Đã thanh toán");
                payment.setTransactionReference(transId);

                order.setOrderStatus("Hoàn tất");
                order.setPaymentStatus("Đã thanh toán");

                orderRepository.save(order);
                paymentRepository.save(payment);

                return ResponseEntity.ok(Map.of(
                        "message", "Payment processed successfully",
                        "resultCode", 0
                ));
            } else {
                payment.setPaymentStatus("Thất bại");
                paymentRepository.save(payment);
                return ResponseEntity.ok(Map.of(
                        "message", "Payment failed: " + message,
                        "resultCode", resultCode
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Error processing callback: " + e.getMessage(),
                    "resultCode", 99
            ));
        }
    }

    @Value("${app.base.url}")
    private String appBaseUrl;

    @Value("${frontend.base.url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping("/return")
    public ResponseEntity<String> handleReturn(@RequestParam Map<String, String> params) {

        String resultCode = params.get("resultCode");
        String orderId = params.get("orderId");
        String message = params.get("message");

        String redirectUrl = "/momo-return.html?resultCode=" + resultCode
                + "&orderId=" + orderId 
                + "&message=" + (message != null ? java.net.URLEncoder.encode(message, java.nio.charset.StandardCharsets.UTF_8) : "");
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", redirectUrl)
                .build();
    }

    private String signHmacSHA256(String data, String secretKey) throws Exception {
        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSHA256.init(secretKeySpec);
        byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
