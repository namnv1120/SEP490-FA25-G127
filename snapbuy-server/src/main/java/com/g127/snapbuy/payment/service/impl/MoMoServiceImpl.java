package com.g127.snapbuy.payment.service.impl;

import com.g127.snapbuy.payment.dto.response.MomoPaymentResponse;
import com.g127.snapbuy.entity.Order;
import com.g127.snapbuy.repository.OrderRepository;
import com.g127.snapbuy.payment.service.MoMoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoMoServiceImpl implements MoMoService {

    private final OrderRepository orderRepository;

    @Value("${app.base.url}")
    private String baseUrl;

    @Value("${frontend.base.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${momo.dev.endpoint}")
    private String momoEndpoint;

    @Value("${momo.dev.accessKey}")
    private String accessKey;

    @Value("${momo.dev.partnerCode}")
    private String partnerCode;

    @Value("${momo.dev.secretKey}")
    private String secretKey;

    @Value("${momo.createUrl}")
    private String createUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public MomoPaymentResponse createPayment(UUID orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

            BigDecimal amount = order.getTotalAmount();
            String amountStr = amount.setScale(0, RoundingMode.HALF_UP).toPlainString();

            String requestId = UUID.randomUUID().toString();
            String momoOrderId = order.getOrderNumber() + "-" + System.currentTimeMillis();

            // Get current tenantId from TenantContext
            String tenantId = com.g127.snapbuy.tenant.context.TenantContext.getCurrentTenant();
            String extraDataRaw = "tenantId=" + (tenantId != null ? tenantId : "");
            String extraData = java.util.Base64.getEncoder().encodeToString(extraDataRaw.getBytes());

            String returnUrl = baseUrl + "/api/payments/momo/return?tenantId=" + (tenantId != null ? tenantId : "");
            String notifyUrl = baseUrl + "/api/payments/momo/notify?tenantId=" + (tenantId != null ? tenantId : "");

            String orderInfo = "Thanh toán đơn hàng " + order.getOrderNumber();

            String rawHash = "accessKey=" + accessKey
                    + "&amount=" + amountStr
                    + "&extraData=" + extraData
                    + "&ipnUrl=" + notifyUrl
                    + "&orderId=" + momoOrderId
                    + "&orderInfo=" + orderInfo
                    + "&partnerCode=" + partnerCode
                    + "&redirectUrl=" + returnUrl
                    + "&requestId=" + requestId
                    + "&requestType=captureWallet";

            String signature = signHmacSHA256(rawHash, secretKey);

            Map<String, Object> body = new HashMap<>();
            body.put("partnerCode", partnerCode);
            body.put("accessKey", accessKey);
            body.put("requestId", requestId);
            body.put("amount", amountStr);
            body.put("orderId", momoOrderId);
            body.put("orderInfo", orderInfo);
            body.put("redirectUrl", returnUrl);
            body.put("ipnUrl", notifyUrl);
            body.put("extraData", extraData);
            body.put("requestType", "captureWallet");
            body.put("autoCapture", true);
            body.put("lang", "vi");
            body.put("signature", signature);

            String url = momoEndpoint + createUrl;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            MomoPaymentResponse resp = restTemplate.postForObject(url, entity, MomoPaymentResponse.class);

            return resp;
        } catch (Exception e) {
            throw new RuntimeException("Tạo thanh toán MoMo thất bại: " + e.getMessage(), e);
        }
    }

    private String signHmacSHA256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hash = new StringBuilder();
        for (byte b : bytes) {
            hash.append(String.format("%02x", b));
        }
        return hash.toString();
    }
}
