package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PaymentRequest;
import com.g127.snapbuy.dto.response.PaymentResponse;
import com.g127.snapbuy.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
        response.setMessage("Tạo thanh toán thành công.");
        return response;
    }

    @PutMapping("/{id}/finalize")
    public ApiResponse<PaymentResponse> finalizePayment(@PathVariable UUID id) {
        ApiResponse<PaymentResponse> response = new ApiResponse<>();
        response.setResult(paymentService.finalizePayment(id));
        response.setMessage("Hoàn tất thanh toán thành công.");
        return response;
    }

    @PutMapping("/{id}/refund")
    public ApiResponse<PaymentResponse> refundPayment(@PathVariable UUID id) {
        ApiResponse<PaymentResponse> response = new ApiResponse<>();
        response.setResult(paymentService.refundPayment(id));
        response.setMessage("Hoàn tiền thành công.");
        return response;
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<List<PaymentResponse>> getPaymentsByOrder(@PathVariable UUID orderId) {
        ApiResponse<List<PaymentResponse>> response = new ApiResponse<>();
        response.setResult(paymentService.getPaymentsByOrder(orderId));
        response.setMessage("Lấy danh sách thanh toán theo đơn hàng thành công.");
        return response;
    }

}
