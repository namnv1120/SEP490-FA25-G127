package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PurchaseOrderApproveRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderCreateRequest;
import com.g127.snapbuy.dto.request.PurchaseOrderReceiveRequest;
import com.g127.snapbuy.dto.response.PurchaseOrderResponse;
import com.g127.snapbuy.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<PurchaseOrderResponse> create(@Valid @RequestBody PurchaseOrderCreateRequest req,
                                                     @AuthenticationPrincipal User principal) {
        ApiResponse<PurchaseOrderResponse> response = new ApiResponse<>();
        response.setResult(service.create(req, principal.getUsername()));
        return response;
    }

    @PutMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<PurchaseOrderResponse> receive(@PathVariable UUID id,
                                                      @Valid @RequestBody PurchaseOrderReceiveRequest req,
                                                      @AuthenticationPrincipal User principal) {
        ApiResponse<PurchaseOrderResponse> response = new ApiResponse<>();
        response.setResult(service.receive(id, req, principal.getUsername()));
        return response;
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<PurchaseOrderResponse> cancel(@PathVariable UUID id,
                                                     @AuthenticationPrincipal User principal) {
        ApiResponse<PurchaseOrderResponse> response = new ApiResponse<>();
        response.setResult(service.cancel(id, principal.getUsername()));
        return response;
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PurchaseOrderResponse> approve(@PathVariable UUID id,
                                                      @Valid @RequestBody PurchaseOrderApproveRequest req,
                                                      @AuthenticationPrincipal User principal) {
        ApiResponse<PurchaseOrderResponse> response = new ApiResponse<>();
        response.setResult(service.approve(id, req, principal.getUsername()));
        response.setMessage("Phiếu đã được duyệt!");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<List<PurchaseOrderResponse>> getAll() {
        ApiResponse<List<PurchaseOrderResponse>> response = new ApiResponse<>();
        response.setResult(service.findAll());
        return response;
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<Page<PurchaseOrderResponse>> search(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200),
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "orderDate"));
        ApiResponse<org.springframework.data.domain.Page<PurchaseOrderResponse>> response = new ApiResponse<>();
        response.setResult(service.search(status, supplierId, from, to, pageable));
        return response;
    }

    @DeleteMapping("{id}")
    public ApiResponse<String> delete(@PathVariable("id") UUID id) {
        service.deletePurchaseOrder(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Xoá phiếu thành công");
        return response;
    }

}
