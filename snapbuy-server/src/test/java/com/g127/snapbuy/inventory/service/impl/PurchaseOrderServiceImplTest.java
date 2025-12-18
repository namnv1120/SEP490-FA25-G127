package com.g127.snapbuy.inventory.service.impl;

import com.g127.snapbuy.inventory.dto.response.PurchaseOrderResponse;
import com.g127.snapbuy.inventory.entity.*;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.inventory.mapper.PurchaseOrderMapper;
import com.g127.snapbuy.inventory.repository.*;
import com.g127.snapbuy.product.repository.ProductRepository;
import com.g127.snapbuy.supplier.repository.SupplierRepository;
import com.g127.snapbuy.account.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderServiceImplTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepo;

    @Mock
    private PurchaseOrderDetailRepository detailRepo;

    @Mock
    private ProductRepository productRepo;

    @Mock
    private SupplierRepository supplierRepo;

    @Mock
    private AccountRepository accountRepo;

    @Mock
    private InventoryRepository inventoryRepo;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepo;

    @Mock
    private PurchaseOrderMapper purchaseOrderMapper;

    @InjectMocks
    private PurchaseOrderServiceImpl purchaseOrderService;

    private PurchaseOrder testPurchaseOrder;
    private UUID purchaseOrderId;

    @BeforeEach
    void setUp() {
        purchaseOrderId = UUID.randomUUID();

        testPurchaseOrder = new PurchaseOrder();
        testPurchaseOrder.setId(purchaseOrderId);
        testPurchaseOrder.setNumber("PO-001");
        testPurchaseOrder.setStatus("PENDING");
        testPurchaseOrder.setTotalAmount(BigDecimal.valueOf(1000000));
    }

    @Test
    void getPurchaseOrderById_Success() {
        // Given
        when(purchaseOrderRepo.findById(purchaseOrderId)).thenReturn(Optional.of(testPurchaseOrder));
        when(detailRepo.findByPurchaseOrderId(purchaseOrderId)).thenReturn(Collections.emptyList());
        when(purchaseOrderMapper.toResponseWithDetails(any(), anyList(), any(), any()))
            .thenReturn(new PurchaseOrderResponse());

        // When
        PurchaseOrderResponse result = purchaseOrderService.getPurchaseOrderById(purchaseOrderId);

        // Then
        assertNotNull(result);
        verify(purchaseOrderRepo).findById(purchaseOrderId);
    }

    @Test
    void getPurchaseOrderById_NotFound_ThrowsException() {
        // Given
        when(purchaseOrderRepo.findById(purchaseOrderId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class,
            () -> purchaseOrderService.getPurchaseOrderById(purchaseOrderId));
    }

    @Test
    void deletePurchaseOrder_Success() {
        // Given
        when(purchaseOrderRepo.findById(purchaseOrderId)).thenReturn(Optional.of(testPurchaseOrder));
        doNothing().when(detailRepo).deleteAllByPurchaseOrderId(purchaseOrderId);
        doNothing().when(detailRepo).flush();
        doNothing().when(purchaseOrderRepo).delete(testPurchaseOrder);
        doNothing().when(purchaseOrderRepo).flush();

        // When
        purchaseOrderService.deletePurchaseOrder(purchaseOrderId);

        // Then
        verify(detailRepo).deleteAllByPurchaseOrderId(purchaseOrderId);
        verify(purchaseOrderRepo).delete(testPurchaseOrder);
    }

    @Test
    void deletePurchaseOrder_NotFound_ThrowsException() {
        // Given
        when(purchaseOrderRepo.findById(purchaseOrderId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> purchaseOrderService.deletePurchaseOrder(purchaseOrderId));
        assertEquals(ErrorCode.PURCHASE_ORDER_NOT_FOUND, exception.getErrorCode());
        verify(detailRepo, never()).deleteAllByPurchaseOrderId(any());
        verify(purchaseOrderRepo, never()).delete(any());
    }

    @Test
    void deletePurchaseOrder_DeleteDetailsFirst_Success() {
        // Given
        when(purchaseOrderRepo.findById(purchaseOrderId)).thenReturn(Optional.of(testPurchaseOrder));
        doNothing().when(detailRepo).deleteAllByPurchaseOrderId(purchaseOrderId);
        doNothing().when(detailRepo).flush();
        doNothing().when(purchaseOrderRepo).delete(testPurchaseOrder);
        doNothing().when(purchaseOrderRepo).flush();

        // When
        purchaseOrderService.deletePurchaseOrder(purchaseOrderId);

        // Then
        var inOrder = inOrder(detailRepo, purchaseOrderRepo);
        inOrder.verify(detailRepo).deleteAllByPurchaseOrderId(purchaseOrderId);
        inOrder.verify(detailRepo).flush();
        inOrder.verify(purchaseOrderRepo).delete(testPurchaseOrder);
        inOrder.verify(purchaseOrderRepo).flush();
    }

    @Test
    void deletePurchaseOrder_ExceptionDuringDelete_ThrowsRuntimeException() {
        // Given
        when(purchaseOrderRepo.findById(purchaseOrderId)).thenReturn(Optional.of(testPurchaseOrder));
        doThrow(new RuntimeException("Database error")).when(detailRepo).deleteAllByPurchaseOrderId(purchaseOrderId);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> purchaseOrderService.deletePurchaseOrder(purchaseOrderId));
        assertTrue(exception.getMessage().contains("Lỗi khi xoá phiếu nhập hàng"));
    }
}
