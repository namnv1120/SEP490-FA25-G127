package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PaymentRequest;
import com.g127.snapbuy.dto.response.PaymentResponse;
import com.g127.snapbuy.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> createPayment(@RequestBody PaymentRequest request) {
        ApiResponse<PaymentResponse> response = new ApiResponse<>();
        response.setResult(paymentService.createPayment(request));
        response.setMessage("Payment created successfully");
        return response;
    }

    @PutMapping("/{id}/finalize")
    public ApiResponse<PaymentResponse> finalizePayment(@PathVariable UUID id) {
        ApiResponse<PaymentResponse> response = new ApiResponse<>();
        response.setResult(paymentService.finalizePayment(id));
        response.setMessage("Payment finalized successfully");
        return response;
    }

    @PutMapping("/{id}/refund")
    public ApiResponse<PaymentResponse> refundPayment(@PathVariable UUID id) {
        ApiResponse<PaymentResponse> response = new ApiResponse<>();
        response.setResult(paymentService.refundPayment(id));
        response.setMessage("Payment refunded successfully");
        return response;
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<List<PaymentResponse>> getPaymentsByOrder(@PathVariable UUID orderId) {
        ApiResponse<List<PaymentResponse>> response = new ApiResponse<>();
        response.setResult(paymentService.getPaymentsByOrder(orderId));
        response.setMessage("Payments fetched successfully");
        return response;
    }

    @PostMapping("/momo/notify")
    public ResponseEntity<String> handleMomoNotify(@RequestBody Map<String, Object> payload) {
        log.info("MoMo notify received: {}", payload);
        String resultCode = String.valueOf(payload.get("resultCode"));
        String requestId = String.valueOf(payload.get("requestId"));
        if ("0".equals(resultCode)) {
            paymentService.finalizePaymentByReference(requestId);
        }
        return ResponseEntity.ok("Received");
    }
}
