package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.PurchaseOrderApproveRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderCreateRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderReceiveRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderUpdateRequest;
import com.g127.snapbuy.dto.response.PageResponse;
import com.g127.snapbuy.dto.response.PurchaseOrderResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PurchaseOrderService {
    PurchaseOrderResponse create(PurchaseOrderCreateRequest req, String usernameOrEmail);

    PurchaseOrderResponse receive(UUID poId, PurchaseOrderReceiveRequest req, String usernameOrEmail);

    PurchaseOrderResponse approve(UUID poId, PurchaseOrderApproveRequest req, String usernameOrEmail);

    PurchaseOrderResponse cancel(UUID poId, String usernameOrEmail);

    List<PurchaseOrderResponse> findAll();

    PageResponse<PurchaseOrderResponse> search(String status, UUID supplierId, LocalDateTime from, LocalDateTime to, Pageable pageable);
    
    PageResponse<PurchaseOrderResponse> searchByKeyword(String keyword, Pageable pageable);

    void deletePurchaseOrder(UUID poId);

    PurchaseOrderResponse getPurchaseOrderById(UUID poId);

    PurchaseOrderResponse update(UUID poId, PurchaseOrderUpdateRequest req, String usernameOrEmail);
}
