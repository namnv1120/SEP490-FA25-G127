package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.MomoPaymentResponse;
import com.g127.snapbuy.service.MoMoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/momo")
@RequiredArgsConstructor
public class MoMoController {

    private final MoMoService moMoService;

    @PostMapping("/create/{orderId}")
    public ApiResponse<MomoPaymentResponse> createPayment(@PathVariable UUID orderId) {
        ApiResponse<MomoPaymentResponse> response = new ApiResponse<>();
        response.setResult(moMoService.createPayment(orderId));
        response.setMessage("MoMo QR created successfully");
        return response;
    }
}
