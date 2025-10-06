package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.SupplierCreateRequest;
import com.g127.snapbuy.dto.request.SupplierUpdateRequest;
import com.g127.snapbuy.dto.response.SupplierResponse;
import com.g127.snapbuy.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    private final SupplierService supplierService;

    @PostMapping
    public ApiResponse<SupplierResponse> createSupplier(@RequestBody @Valid SupplierCreateRequest request) {
        ApiResponse<SupplierResponse> response = new ApiResponse<>();
        response.setResult(supplierService.createSupplier(request));
        return response;
    }

    @PutMapping
    public ApiResponse<SupplierResponse> updateSupplier(
            @PathVariable("id") UUID id,
            @RequestBody @Valid SupplierUpdateRequest request) {
        ApiResponse<SupplierResponse> response = new ApiResponse<>();
        response.setResult(supplierService.updateSupplier(id, request));
        return response;
    }

    @GetMapping
    public ApiResponse<List<SupplierResponse>> getAllSuppliers() {
        ApiResponse<List<SupplierResponse>> response = new ApiResponse<>();
        response.setResult(supplierService.getAllSuppliers());
        return response;
    }

    @GetMapping("{id}")
    public ApiResponse<SupplierResponse> getSupplierById(@PathVariable("id") UUID id) {
        ApiResponse<SupplierResponse> response = new ApiResponse<>();
        response.setResult(supplierService.getSupplierById(id));
        return response;
    }

    @DeleteMapping("{id}")
    public ApiResponse<String> deleteSupplierById(@PathVariable("id") UUID id) {
        supplierService.deleteSupplier(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Supplier deleted");
        return response;
    }


}
