package com.g127.snapbuy.supplier.service.impl;

import com.g127.snapbuy.supplier.dto.request.SupplierCreateRequest;
import com.g127.snapbuy.supplier.dto.request.SupplierUpdateRequest;
import com.g127.snapbuy.supplier.dto.response.SupplierResponse;
import com.g127.snapbuy.supplier.entity.Supplier;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.supplier.mapper.SupplierMapper;
import com.g127.snapbuy.supplier.repository.SupplierRepository;
import com.g127.snapbuy.supplier.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
        // Trả về tất cả suppliers (bao gồm cả inactive) để admin có thể quản lý
        // Frontend sẽ filter theo active khi hiển thị trong dropdown
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

    @Override
    public SupplierResponse toggleSupplierStatus(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        supplier.setActive(!supplier.isActive());
        supplier.setUpdatedDate(LocalDateTime.now());
        Supplier savedSupplier = supplierRepository.save(supplier);
        return supplierMapper.toResponse(savedSupplier);
    }
}
