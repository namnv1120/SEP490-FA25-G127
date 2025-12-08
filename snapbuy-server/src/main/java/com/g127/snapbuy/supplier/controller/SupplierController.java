package com.g127.snapbuy.supplier.controller;

import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.supplier.dto.request.SupplierCreateRequest;
import com.g127.snapbuy.supplier.dto.request.SupplierUpdateRequest;
import com.g127.snapbuy.supplier.dto.response.SupplierResponse;
import com.g127.snapbuy.supplier.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<SupplierResponse> createSupplier(@RequestBody @Valid SupplierCreateRequest request) {
        ApiResponse<SupplierResponse> response = new ApiResponse<>();
        response.setResult(supplierService.createSupplier(request));
        return response;
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<SupplierResponse> updateSupplier(
            @PathVariable("id") UUID id,
            @RequestBody @Valid SupplierUpdateRequest request) {
        ApiResponse<SupplierResponse> response = new ApiResponse<>();
        response.setResult(supplierService.updateSupplier(id, request));
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<List<SupplierResponse>> getAllSuppliers() {
        ApiResponse<List<SupplierResponse>> response = new ApiResponse<>();
        response.setResult(supplierService.getAllSuppliers());
        return response;
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<SupplierResponse> getSupplierById(@PathVariable("id") UUID id) {
        ApiResponse<SupplierResponse> response = new ApiResponse<>();
        response.setResult(supplierService.getSupplierById(id));
        return response;
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> deleteSupplierById(@PathVariable("id") UUID id) {
        supplierService.deleteSupplier(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Nhà cung cấp đã được xóa");
        return response;
    }

    @PatchMapping("{id}/toggle-status")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<SupplierResponse> toggleSupplierStatus(@PathVariable("id") UUID id) {
        ApiResponse<SupplierResponse> response = new ApiResponse<>();
        response.setResult(supplierService.toggleSupplierStatus(id));
        return response;
    }

}
