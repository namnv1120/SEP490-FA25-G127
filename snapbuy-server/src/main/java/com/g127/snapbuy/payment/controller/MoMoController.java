package com.g127.snapbuy.payment.controller;

import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
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
    public ResponseEntity<String> handleMomoReturn(
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
        String status = (resultCode == 0) ? "success" : "failed";
        String html = "<!DOCTYPE html>\n" +
                "<html lang=\"vi\"><head><meta charset=\"utf-8\"/>" +
                "<title>Đóng cửa sổ thanh toán</title>" +
                "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/></head>" +
                "<body style=\"font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;\">" +
                "<div style=\"text-align:center\">" +
                "<h2>Thanh toán MoMo: " + (resultCode == 0 ? "Thành công" : "Thất bại") + "</h2>" +
                "<p>Cửa sổ sẽ tự đóng...</p>" +
                "<button onclick=\"window.close()\" style=\"padding:8px 16px;margin-top:12px\">Đóng</button>" +
                "</div>" +
                "<script>\n" +
                "(function(){\n" +
                "  try {\n" +
                "    if (window.opener) {\n" +
                "      window.opener.postMessage({ source: 'momo', status: '" + status + "', requestId: '" + (requestId == null ? "" : requestId) + "' }, '*');\n" +
                "      try { window.opener.focus(); } catch(e){}\n" +
                "    }\n" +
                "  } catch(e) {}\n" +
                "  function tryClose(){\n" +
                "    try { window.close(); } catch(e){}\n" +
                "    try { window.top.close(); } catch(e){}\n" +
                "    try { window.open('', '_self'); window.close(); } catch(e){}\n" +
                "  }\n" +
                "  tryClose();\n" +
                "  var attempts = 20;\n" +
                "  var timer = setInterval(function(){\n" +
                "    attempts--; tryClose(); if (attempts <= 0) clearInterval(timer);\n" +
                "  }, 200);\n" +
                "})();\n" +
                "</script></body></html>";

        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
    }

    @RestController
    @RequestMapping("/payments/momo")
    public class PaymentController {

        @GetMapping("/return")
        public ResponseEntity<String> momoReturn(
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
            String status = (resultCode == 0) ? "success" : "failed";
            String html = "<!DOCTYPE html>\n" +
                    "<html lang=\"vi\"><head><meta charset=\"utf-8\"/>" +
                    "<title>Đóng cửa sổ thanh toán</title>" +
                    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/></head>" +
                    "<body style=\"font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;\">" +
                    "<div style=\"text-align:center\">" +
                    "<h2>Thanh toán MoMo: " + (resultCode == 0 ? "Thành công" : "Thất bại") + "</h2>" +
                    "<p>Cửa sổ sẽ tự đóng...</p>" +
                    "<button onclick=\"window.close()\" style=\"padding:8px 16px;margin-top:12px\">Đóng</button>" +
                    "</div>" +
                    "<script>\n" +
                    "(function(){\n" +
                    "  try {\n" +
                    "    if (window.opener) {\n" +
                    "      window.opener.postMessage({ source: 'momo', status: '" + status + "', requestId: '" + (requestId == null ? "" : requestId) + "' }, '*');\n" +
                    "      try { window.opener.focus(); } catch(e){}\n" +
                    "    }\n" +
                    "  } catch(e) {}\n" +
                    "  function tryClose(){\n" +
                    "    try { window.close(); } catch(e){}\n" +
                    "    try { window.top.close(); } catch(e){}\n" +
                    "    try { window.open('', '_self'); window.close(); } catch(e){}\n" +
                    "  }\n" +
                    "  tryClose();\n" +
                    "  var attempts = 20;\n" +
                    "  var timer = setInterval(function(){\n" +
                    "    attempts--; tryClose(); if (attempts <= 0) clearInterval(timer);\n" +
                    "  }, 200);\n" +
                    "})();\n" +
                    "</script></body></html>";

            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(html);
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