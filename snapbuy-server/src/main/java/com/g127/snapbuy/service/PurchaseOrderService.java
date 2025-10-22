package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.PurchaseOrderCreateRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderReceiveRequest;
import com.g127.snapbuy.dto.response.PurchaseOrderResponse;

import java.util.UUID;

public interface PurchaseOrderService {

    PurchaseOrderResponse create(PurchaseOrderCreateRequest req);

    PurchaseOrderResponse receive(UUID purchaseOrderId, PurchaseOrderReceiveRequest req);

    PurchaseOrderResponse cancel(UUID purchaseOrderId);
}
