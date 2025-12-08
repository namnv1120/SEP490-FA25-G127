package com.g127.snapbuy.supplier.service;

import com.g127.snapbuy.supplier.dto.request.SupplierCreateRequest;
import com.g127.snapbuy.supplier.dto.request.SupplierUpdateRequest;
import com.g127.snapbuy.supplier.dto.response.SupplierResponse;

import java.util.List;
import java.util.UUID;

public interface SupplierService {
    SupplierResponse createSupplier(SupplierCreateRequest request);

    SupplierResponse getSupplierById(UUID id);

    List<SupplierResponse> getAllSuppliers();

    SupplierResponse updateSupplier(UUID id, SupplierUpdateRequest request);

    void deleteSupplier(UUID id);

    SupplierResponse toggleSupplierStatus(UUID id);
}
