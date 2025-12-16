package com.g127.snapbuy.supplier.service.impl;

import com.g127.snapbuy.supplier.dto.request.SupplierCreateRequest;
import com.g127.snapbuy.supplier.dto.request.SupplierUpdateRequest;
import com.g127.snapbuy.supplier.dto.response.SupplierResponse;
import com.g127.snapbuy.supplier.entity.Supplier;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.supplier.mapper.SupplierMapper;
import com.g127.snapbuy.supplier.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceImplTest {

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private SupplierMapper supplierMapper;

    @InjectMocks
    private SupplierServiceImpl supplierService;

    private Supplier testSupplier;
    private SupplierResponse supplierResponse;
    private UUID supplierId;

    @BeforeEach
    void setUp() {
        supplierId = UUID.randomUUID();

        testSupplier = new Supplier();
        testSupplier.setSupplierId(supplierId);
        testSupplier.setSupplierName("Test Supplier");
        testSupplier.setPhone("0123456789");
        testSupplier.setEmail("supplier@test.com");
        testSupplier.setAddress("123 Test St");
        testSupplier.setActive(true);

        supplierResponse = SupplierResponse.builder()
                .supplierId(supplierId)
                .supplierName("Test Supplier")
                .phone("0123456789")
                .email("supplier@test.com")
                .address("123 Test St")
                .active(true)
                .build();
    }

    @Test
    void createSupplier_Success() {
        // Given
        SupplierCreateRequest request = new SupplierCreateRequest();
        request.setSupplierName("New Supplier");
        request.setPhone("0987654321");

        when(supplierMapper.toEntity(any(SupplierCreateRequest.class))).thenReturn(testSupplier);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(testSupplier);
        when(supplierMapper.toResponse(any(Supplier.class))).thenReturn(supplierResponse);

        // When
        SupplierResponse result = supplierService.createSupplier(request);

        // Then
        assertNotNull(result);
        assertEquals(supplierId, result.getSupplierId());
        verify(supplierRepository).save(any(Supplier.class));
    }

    @Test
    void getSupplierById_Success() {
        // Given
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(testSupplier));
        when(supplierMapper.toResponse(any(Supplier.class))).thenReturn(supplierResponse);

        // When
        SupplierResponse result = supplierService.getSupplierById(supplierId);

        // Then
        assertNotNull(result);
        assertEquals(supplierId, result.getSupplierId());
        assertEquals("Test Supplier", result.getSupplierName());
    }

    @Test
    void getSupplierById_NotFound_ThrowsException() {
        // Given
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> supplierService.getSupplierById(supplierId));
        assertEquals(ErrorCode.SUPPLIER_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getAllSuppliers_Success() {
        // Given
        List<Supplier> suppliers = Arrays.asList(testSupplier);
        when(supplierRepository.findAll()).thenReturn(suppliers);
        when(supplierMapper.toResponse(any(Supplier.class))).thenReturn(supplierResponse);

        // When
        List<SupplierResponse> result = supplierService.getAllSuppliers();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAllSuppliers_IncludesInactive() {
        // Given
        Supplier inactiveSupplier = new Supplier();
        inactiveSupplier.setSupplierId(UUID.randomUUID());
        inactiveSupplier.setSupplierName("Inactive Supplier");
        inactiveSupplier.setActive(false);

        List<Supplier> suppliers = Arrays.asList(testSupplier, inactiveSupplier);
        when(supplierRepository.findAll()).thenReturn(suppliers);
        when(supplierMapper.toResponse(any(Supplier.class))).thenReturn(supplierResponse);

        // When
        List<SupplierResponse> result = supplierService.getAllSuppliers();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    void updateSupplier_Success() {
        // Given
        SupplierUpdateRequest request = new SupplierUpdateRequest();
        request.setSupplierName("Updated Supplier");

        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(testSupplier));
        when(supplierRepository.save(any(Supplier.class))).thenReturn(testSupplier);
        when(supplierMapper.toResponse(any(Supplier.class))).thenReturn(supplierResponse);

        // When
        SupplierResponse result = supplierService.updateSupplier(supplierId, request);

        // Then
        assertNotNull(result);
        verify(supplierMapper).updateEntity(testSupplier, request);
        verify(supplierRepository).save(testSupplier);
    }

    @Test
    void updateSupplier_NotFound_ThrowsException() {
        // Given
        SupplierUpdateRequest request = new SupplierUpdateRequest();
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> supplierService.updateSupplier(supplierId, request));
        assertEquals(ErrorCode.SUPPLIER_NOT_FOUND, exception.getErrorCode());
        verify(supplierRepository, never()).save(any(Supplier.class));
    }

    @Test
    void deleteSupplier_Success() {
        // Given
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(testSupplier));

        // When
        supplierService.deleteSupplier(supplierId);

        // Then
        verify(supplierRepository).delete(testSupplier);
    }

    @Test
    void deleteSupplier_NotFound_ThrowsException() {
        // Given
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> supplierService.deleteSupplier(supplierId));
        assertEquals(ErrorCode.SUPPLIER_NOT_FOUND, exception.getErrorCode());
        verify(supplierRepository, never()).delete(any(Supplier.class));
    }

    @Test
    void toggleSupplierStatus_Success() {
        // Given
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.of(testSupplier));
        when(supplierRepository.save(any(Supplier.class))).thenReturn(testSupplier);
        when(supplierMapper.toResponse(any(Supplier.class))).thenReturn(supplierResponse);

        // When
        SupplierResponse result = supplierService.toggleSupplierStatus(supplierId);

        // Then
        assertNotNull(result);
        verify(supplierRepository).save(argThat(supplier -> !supplier.isActive()));
    }

    @Test
    void toggleSupplierStatus_NotFound_ThrowsException() {
        // Given
        when(supplierRepository.findById(supplierId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> supplierService.toggleSupplierStatus(supplierId));
        assertEquals(ErrorCode.SUPPLIER_NOT_FOUND, exception.getErrorCode());
        verify(supplierRepository, never()).save(any(Supplier.class));
    }
}
