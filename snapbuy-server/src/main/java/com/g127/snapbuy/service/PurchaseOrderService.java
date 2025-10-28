package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.PurchaseOrderApproveRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderCreateRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderReceiveRequest;
import com.g127.snapbuy.dto.response.PurchaseOrderResponse;

import java.util.UUID;

public interface PurchaseOrderService {
    PurchaseOrderResponse create(PurchaseOrderCreateRequest req, String usernameOrEmail);

    PurchaseOrderResponse receive(UUID poId, PurchaseOrderReceiveRequest req, String usernameOrEmail);

    PurchaseOrderResponse approve(UUID poId, PurchaseOrderApproveRequest req, String usernameOrEmail);

    PurchaseOrderResponse cancel(UUID poId, String usernameOrEmail);
}

