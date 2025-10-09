package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PaymentRequest;
import com.g127.snapbuy.dto.response.PaymentResponse;
import com.g127.snapbuy.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> createPayment(@RequestBody @Valid PaymentRequest request) {
        ApiResponse<PaymentResponse> response = new ApiResponse<>();
        response.setResult(paymentService.createPayment(request));
        return response;
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<List<PaymentResponse>> getPaymentsByOrder(@PathVariable("orderId") UUID orderId) {
        ApiResponse<List<PaymentResponse>> response = new ApiResponse<>();
        response.setResult(paymentService.getPaymentsByOrder(orderId));
        return response;
    }
}
