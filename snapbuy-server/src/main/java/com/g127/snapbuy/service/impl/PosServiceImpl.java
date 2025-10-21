package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.PosOrderRequest;
import com.g127.snapbuy.dto.response.PosOrderResponse;
import com.g127.snapbuy.service.PosService;
import org.springframework.stereotype.Service;

@Service
public class PosServiceImpl implements PosService {

    @Override
    public PosOrderResponse createPosOrder(PosOrderRequest request) {
        PosOrderResponse response = new PosOrderResponse();
        response.setMessage("POS order created successfully (mock data)");
        return response;
    }

    @Override
    public PosOrderResponse getOrderSummary(String orderId) {
        PosOrderResponse response = new PosOrderResponse();
        response.setMessage("POS order summary (mock data)");
        return response;
    }
}
