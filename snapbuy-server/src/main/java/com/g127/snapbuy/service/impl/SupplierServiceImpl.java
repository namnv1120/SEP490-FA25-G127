package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.SupplierCreateRequest;
import com.g127.snapbuy.dto.request.SupplierUpdateRequest;
import com.g127.snapbuy.dto.response.SupplierResponse;
import com.g127.snapbuy.entity.Supplier;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.SupplierMapper;
import com.g127.snapbuy.repository.SupplierRepository;
import com.g127.snapbuy.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public SupplierResponse createSupplier(SupplierCreateRequest request) {
        Supplier supplier = supplierMapper.toEntity(request);
        supplier.setCreatedDate(LocalDateTime.now());
        supplier.setUpdatedDate(LocalDateTime.now());
        supplierRepository.save(supplier);
        return supplierMapper.toResponse(supplier);
    }

    @Override
    public SupplierResponse getSupplierById(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        return supplierMapper.toResponse(supplier);
    }

    @Override
    public List<SupplierResponse> getAllSuppliers() {
        List<Supplier> suppliers = supplierRepository.findAll();
        return suppliers.stream()
                .map(supplierMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SupplierResponse updateSupplier(UUID id, SupplierUpdateRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        supplierMapper.updateEntity(supplier, request);
        supplier.setUpdatedDate(LocalDateTime.now());
        return supplierMapper.toResponse(supplierRepository.save(supplier));
    }

    @Override
    public void deleteSupplier(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        supplierRepository.delete(supplier);
    }
}
