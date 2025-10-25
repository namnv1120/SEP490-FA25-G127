package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.service.MoMoService;
import com.g127.snapbuy.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
@Slf4j
public class MoMoController {

    private final MoMoService moMoService;
    private final PaymentService paymentService;

    @PostMapping("/notify")
    public ApiResponse<String> handleMomoNotify(@RequestBody Map<String, Object> payload) {
        ApiResponse<String> response = new ApiResponse<>();
        try {
            log.info("MoMo Notify: {}", payload);
            String resultCode = String.valueOf(payload.get("resultCode"));
            String requestId = String.valueOf(payload.get("requestId"));

            if ("0".equals(resultCode)) {
                paymentService.finalizePaymentByReference(requestId);
                log.info("Xác nhận thanh toán cho yêu cầu MoMo {}", requestId);
                response.setResult("Thanh toán thành công.");
            } else {
                log.warn("Thanh toán MoMo thất bại, resultCode={}", resultCode);
                response.setResult("Thanh toán thất bại.");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý notify MoMo: {}", e.getMessage(), e);
            response.setResult("Đã xảy ra lỗi khi xử lý thanh toán.");
        }
        return response;
    }

    @GetMapping("/return")
    public ApiResponse<String> handleMomoReturn(@RequestParam Map<String, String> params) {
        ApiResponse<String> response = new ApiResponse<>();
        try {
            log.info("MoMo Return: {}", params);
            String resultCode = params.get("resultCode");
            String requestId = params.get("requestId");

            if ("0".equals(resultCode)) {
                paymentService.finalizePaymentByReference(requestId);
                response.setResult("Thanh toán thành công.");
            } else {
                response.setResult("Thanh toán thất bại, vui lòng thử lại.");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý return MoMo: {}", e.getMessage(), e);
            response.setResult("Đã xảy ra lỗi khi xử lý thanh toán.");
        }
        return response;
    }
}
