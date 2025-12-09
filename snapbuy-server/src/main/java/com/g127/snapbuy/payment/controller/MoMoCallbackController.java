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

    /**
     * IPN (Instant Payment Notification) endpoint for MoMo callback
     * This is called by MoMo server when payment is processed
     */
    @PostMapping("/notify")
    public ResponseEntity<Map<String, Object>> handleNotify(@RequestBody Map<String, Object> payload) {
        log.info("=== MoMo IPN Callback Received ===");
        log.info("Payload: {}", payload);

        try {
            // Extract data from payload
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

            // Verify signature
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
                log.error("Invalid signature. Expected: {}, Got: {}", calculatedSignature, signature);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "message", "Invalid signature",
                        "resultCode", 99
                ));
            }

            // Extract order number from momoOrderId (format: ORDER-NUMBER-timestamp)
            String orderNumber = orderId.substring(0, orderId.lastIndexOf("-"));
            log.info("Extracted order number: {} from momoOrderId: {}", orderNumber, orderId);

            // Find order by order number
            List<Order> allOrders = orderRepository.findAll();
            Order order = allOrders.stream()
                    .filter(o -> orderNumber.equals(o.getOrderNumber()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber));

            log.info("Found order: orderId={}, orderNumber={}", order.getOrderId(), order.getOrderNumber());

            // Find payment by order
            Payment payment = paymentRepository.findByOrder(order);
            if (payment == null) {
                throw new RuntimeException("Payment not found for order: " + orderNumber);
            }
            
            log.info("Found payment: paymentId={}, method={}, status={}", 
                    payment.getPaymentId(), payment.getPaymentMethod(), payment.getPaymentStatus());

            // Update payment based on result code
            if (resultCode == 0) {
                // Payment successful
                payment.setPaymentStatus("Đã thanh toán");
                payment.setTransactionReference(transId);

                // Update order status to completed
                order.setOrderStatus("Hoàn thành");
                order.setPaymentStatus("Đã thanh toán");

                orderRepository.save(order);
                paymentRepository.save(payment);

                log.info("✅ Payment successful for order: {}, transId: {}", orderNumber, transId);
                log.info("✅ Order status: {}, Payment status: {}", order.getOrderStatus(), payment.getPaymentStatus());

                return ResponseEntity.ok(Map.of(
                        "message", "Payment processed successfully",
                        "resultCode", 0
                ));
            } else {
                // Payment failed
                payment.setPaymentStatus("Thất bại");
                paymentRepository.save(payment);

                log.warn("Payment failed for order: {}, resultCode: {}, message: {}", orderNumber, resultCode, message);

                return ResponseEntity.ok(Map.of(
                        "message", "Payment failed: " + message,
                        "resultCode", resultCode
                ));
            }

        } catch (Exception e) {
            log.error("Error processing MoMo callback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Error processing callback: " + e.getMessage(),
                    "resultCode", 99
            ));
        }
    }

    @Value("${app.base.url}")
    private String appBaseUrl;

    /**
     * Return URL endpoint - where user is redirected after payment
     */
    @GetMapping("/return")
    public ResponseEntity<String> handleReturn(@RequestParam Map<String, String> params) {
        log.info("=== MoMo Return URL Called ===");
        log.info("Params: {}", params);

        String resultCode = params.get("resultCode");
        String orderId = params.get("orderId");
        String message = params.get("message");

        // Extract frontend base URL from appBaseUrl
        // If appBaseUrl is https://snapbuy.com.vn, frontend is also at the same domain
        String frontendBaseUrl = appBaseUrl.replace(":8080", ""); // Remove backend port if present
        
        // For local development: http://localhost:8080 -> http://localhost:3000
        // For production: https://snapbuy.com.vn -> https://snapbuy.com.vn
        if (frontendBaseUrl.contains("localhost")) {
            frontendBaseUrl = frontendBaseUrl.replace("8080", "3000");
        }

        // Redirect to POS page with payment result
        String redirectUrl = frontendBaseUrl + "/pos?paymentResult=" + resultCode 
                + "&orderId=" + orderId 
                + "&message=" + (message != null ? message : "");

        log.info("Redirecting to: {}", redirectUrl);

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
