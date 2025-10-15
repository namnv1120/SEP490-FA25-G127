package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.config.Environment;
import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.entity.Order;
import com.g127.snapbuy.entity.Payment;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.repository.OrderRepository;
import com.g127.snapbuy.repository.PaymentRepository;
import com.g127.snapbuy.service.MoMoService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MoMoServiceImpl implements MoMoService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    private Environment environment;
    private final RestTemplate restTemplate;

    @Value("${momo.target}")
    private String environmentTarget;

    public MoMoServiceImpl(OrderRepository orderRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public ApiResponse<String> createPayment(UUID orderId) {
        environment = Environment.selectEnv(environmentTarget);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        BigDecimal totalAmount = order.getTotalAmount();
        Map<String, String> params = new HashMap<>();
        params.put("partnerCode", environment.getPartnerInfo().getPartnerCode());
        params.put("accessKey", environment.getPartnerInfo().getAccessKey());
        params.put("amount", totalAmount.toString());
        params.put("orderId", orderId.toString());
        params.put("orderInfo", "Thanh toán đơn hàng " + order.getOrderNumber());
        params.put("returnUrl", "https://yourwebsite.com/return");
        params.put("notifyUrl", "https://yourwebsite.com/notify");

        String signature = createSignature(params);
        params.put("signature", signature);

        String response = restTemplate.postForObject(environment.getMomoEndpoint().getCreateUrl(), params, String.class);

        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setResult(response);
        apiResponse.setMessage("Payment QR created successfully");

        return apiResponse;
    }


    private String createSignature(Map<String, String> params) {
        StringBuilder data = new StringBuilder();
        params.forEach((key, value) -> {
            if (!value.isEmpty()) {
                data.append(key).append("=").append(value).append("&");
            }
        });
        data.deleteCharAt(data.length() - 1);

        String signature = data.toString() + environment.getPartnerInfo().getSecretKey();
        return signature;
    }

    @Override
    public ApiResponse<String> handlePaymentResult(String resultCode, String orderId) {
        Order order = orderRepository.findById(UUID.fromString(orderId))
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if ("00".equals(resultCode)) {
            order.setPaymentStatus("PAID");
            order.setOrderStatus("COMPLETED");

            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(order.getTotalAmount());
            payment.setPaymentStatus("PAID");
            payment.setPaymentMethod("MoMo");
            paymentRepository.save(payment);
        } else {
            order.setPaymentStatus("FAILED");
            orderRepository.save(order);
        }

        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Payment status updated");
        return response;
    }

}
