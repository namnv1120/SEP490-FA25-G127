package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PosOrderRequest;
import com.g127.snapbuy.dto.response.PosOrderResponse;
import com.g127.snapbuy.service.PosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
public class PosController {

    private final PosService posService;

    @PostMapping("/checkout")
    public ApiResponse<PosOrderResponse> createPosOrder(@RequestBody @Valid PosOrderRequest request) {
        ApiResponse<PosOrderResponse> response = new ApiResponse<>();
        response.setResult(posService.createPosOrder(request));
        return response;
    }

    @GetMapping("/summary/{orderId}")
    public ApiResponse<PosOrderResponse> getOrderSummary(@PathVariable("orderId") String orderId) {
        ApiResponse<PosOrderResponse> response = new ApiResponse<>();
        response.setResult(posService.getOrderSummary(orderId));
        return response;
    }
}
