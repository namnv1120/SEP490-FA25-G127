package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
@Slf4j
public class MoMoController {

    private final OrderService orderService;

    @PostMapping("/notify")
    public ApiResponse<String> handleMomoNotify(@RequestBody Map<String, Object> payload) {
        ApiResponse<String> response = new ApiResponse<>();
        try {
            log.info("MoMo Notify: {}", payload);
            String resultCode = String.valueOf(payload.get("resultCode"));
            String requestId = String.valueOf(payload.get("requestId"));

            if ("0".equals(resultCode)) {
                orderService.finalizePaymentByReference(requestId);
                log.info("Xác nhận thanh toán cho yêu cầu MoMo {}", requestId);
                response.setResult("Thanh toán thành công.");
            } else {
                log.warn("Thanh toán MoMo thất bại, resultCode={}", resultCode);
                try {
                    orderService.cancelOrderByReference(requestId);
                    log.info("Đã hủy đơn do thanh toán MoMo thất bại, requestId={} ", requestId);
                } catch (Exception ex) {
                    log.error("Hủy đơn theo reference thất bại: {}", ex.getMessage(), ex);
                }
                response.setResult("Thanh toán thất bại.");
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý notify MoMo: {}", e.getMessage(), e);
            response.setResult("Đã xảy ra lỗi khi xử lý thanh toán.");
        }
        return response;
    }

    @GetMapping("/return")
    public ResponseEntity<Void> handleMomoReturn(
            @RequestParam(required = false) String requestId,
            @RequestParam int resultCode,
            @RequestParam(required = false) String message
    ) {
        if (requestId != null) {
            if (resultCode == 0) {
                try {
                    orderService.finalizePaymentByReference(requestId);
                } catch (Exception ignored) {
                }
            } else {
                try {
                    orderService.cancelOrderByReference(requestId);
                } catch (Exception ignored) {
                }
            }
        }

        String target = (resultCode == 0)
                ? "http://localhost:5173/pos?payment=success"
                : "http://localhost:5173/pos?payment=failed";

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(java.net.URI.create(target));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

//    @GetMapping("/return")
//    public ApiResponse<String> handleMomoReturn(@RequestParam Map<String, String> params) {
//        ApiResponse<String> response = new ApiResponse<>();
//        try {
//            log.info("MoMo Return: {}", params);
//            String resultCode = params.get("resultCode");
//            String requestId = params.get("requestId");
//
//            if ("0".equals(resultCode)) {
//                orderService.finalizePaymentByReference(requestId);
//                response.setResult("Thanh toán thành công.");
//            } else {
//                response.setResult("Thanh toán thất bại, vui lòng thử lại.");
//            }
//        } catch (Exception e) {
//            log.error("Lỗi khi xử lý return MoMo: {}", e.getMessage(), e);
//            response.setResult("Đã xảy ra lỗi khi xử lý thanh toán.");
//        }
//        return response;
//    }
    

    @RestController
    @RequestMapping("/payments/momo")
    public class PaymentController {

        @GetMapping("/return")
        public ResponseEntity<Void> momoReturn(
                @RequestParam(required = false) String orderId,
                @RequestParam(required = false) String requestId,
                @RequestParam int resultCode,
                @RequestParam(required = false) String message
        ) {
            if (requestId != null) {
                if (resultCode == 0) {
                    try {
                        orderService.finalizePaymentByReference(requestId);
                    } catch (Exception ignored) {
                    }
                } else {
                    try {
                        orderService.cancelOrderByReference(requestId);
                    } catch (Exception ignored) {
                    }
                }
            }

            String target = (resultCode == 0)
                    ? "http://localhost:5173/pos?payment=success"
                    : "http://localhost:5173/pos?payment=failed";

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(java.net.URI.create(target));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        @PostMapping("/ipn")
        public String momoIpn(@RequestParam String requestId, @RequestParam int resultCode) {
            if (resultCode == 0) {
                return "OK";
            }
            return "IGNORED";
        }
    }



}
