package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PurchaseOrderApproveRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderCreateRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderReceiveRequest;
import com.g127.snapbuy.dto.response.PurchaseOrderResponse;
import com.g127.snapbuy.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<PurchaseOrderResponse> create(@Valid @RequestBody PurchaseOrderCreateRequest req) {
        ApiResponse<PurchaseOrderResponse> response = new ApiResponse<>();
        response.setResult(service.create(req));
        response.setMessage("Tạo phiếu nhập hàng thành công.");
        return response;
    }

    @PutMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<PurchaseOrderResponse> receive(@PathVariable UUID id,
                                                      @Valid @RequestBody PurchaseOrderReceiveRequest req) {
        ApiResponse<PurchaseOrderResponse> response = new ApiResponse<>();
        response.setResult(service.receive(id, req));
        response.setMessage("Đã xác nhận nhập hàng và cập nhật tồn kho.");
        return response;
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<PurchaseOrderResponse> cancel(@PathVariable UUID id) {
        ApiResponse<PurchaseOrderResponse> response = new ApiResponse<>();
        response.setResult(service.cancel(id));
        response.setMessage("Đã hủy phiếu nhập hàng.");
        return response;
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PurchaseOrderResponse> approve(@PathVariable UUID id,
                                                      @Valid @RequestBody PurchaseOrderApproveRequest req) {
        ApiResponse<PurchaseOrderResponse> response = new ApiResponse<>();
        response.setResult(service.approve(id, req));
        response.setMessage("Phiếu nhập đã được duyệt.");
        return response;
    }
}
