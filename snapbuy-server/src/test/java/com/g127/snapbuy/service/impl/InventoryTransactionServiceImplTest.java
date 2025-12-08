package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.response.InventoryTransactionResponse;
import com.g127.snapbuy.dto.response.PageResponse;
import com.g127.snapbuy.entity.InventoryTransaction;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.mapper.InventoryTransactionMapper;
import com.g127.snapbuy.repository.InventoryTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryTransactionServiceImplTest {

    @Mock
    private InventoryTransactionRepository transactionRepository;

    @Mock
    private InventoryTransactionMapper mapper;

    @InjectMocks
    private InventoryTransactionServiceImpl transactionService;

    private InventoryTransaction testTransaction;
    private InventoryTransactionResponse transactionResponse;
    private Product testProduct;
    private Account testAccount;
    private UUID transactionId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        transactionId = UUID.randomUUID();
        productId = UUID.randomUUID();

        testProduct = new Product();
        testProduct.setProductId(productId);
        testProduct.setProductCode("PROD001");
        testProduct.setProductName("Test Product");

        testAccount = new Account();
        testAccount.setAccountId(UUID.randomUUID());
        testAccount.setUsername("testuser");

        testTransaction = new InventoryTransaction();
        testTransaction.setTransactionId(transactionId);
        testTransaction.setProduct(testProduct);
        testTransaction.setAccount(testAccount);
        testTransaction.setTransactionType("IN");
        testTransaction.setQuantity(100);
        testTransaction.setTransactionDate(LocalDateTime.now());
        testTransaction.setNotes("Test transaction");

        transactionResponse = InventoryTransactionResponse.builder()
                .transactionId(transactionId)
                .productId(productId)
                .transactionType("IN")
                .quantity(100)
                .transactionDate(LocalDateTime.now())
                .notes("Test transaction")
                .build();
    }

    @Test
    void getAll_Success() {
        // Given
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        when(transactionRepository.findAll(any(Sort.class))).thenReturn(transactions);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        List<InventoryTransactionResponse> result = transactionService.getAll();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(transactionRepository).findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    @Test
    void list_WithNoFilters_Success() {
        // Given
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 10), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            null, null, null, null, null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1, result.getTotalElements());
        assertTrue(result.isFirst());
        assertTrue(result.isLast());
    }

    @Test
    void list_WithProductIdFilter_Success() {
        // Given
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 10), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            productId, null, null, null, null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(transactionRepository).findAll(any(Specification.class), any(PageRequest.class));
    }

    @Test
    void list_WithProductNameFilter_Success() {
        // Given
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 10), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            null, "Test Product", null, null, null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void list_WithTransactionTypeFilter_Success() {
        // Given
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 10), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            null, null, "IN", null, null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void list_WithReferenceTypeFilter_Success() {
        // Given
        testTransaction.setReferenceType("ORDER");
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 10), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            null, null, null, "ORDER", null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void list_WithReferenceIdFilter_Success() {
        // Given
        UUID referenceId = UUID.randomUUID();
        testTransaction.setReferenceId(referenceId);
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 10), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            null, null, null, null, referenceId, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void list_WithDateRangeFilter_Success() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(7);
        LocalDateTime to = LocalDateTime.now();
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 10), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            null, null, null, null, null, from, to
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void list_WithAllFilters_Success() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(7);
        LocalDateTime to = LocalDateTime.now();
        UUID referenceId = UUID.randomUUID();
        testTransaction.setReferenceType("ORDER");
        testTransaction.setReferenceId(referenceId);
        
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 10), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            productId, "Test Product", "IN", "ORDER", referenceId, from, to
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void list_EmptyResult_Success() {
        // Given
        Page<InventoryTransaction> emptyPage = new PageImpl<>(Arrays.asList(), PageRequest.of(0, 10), 0);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(emptyPage);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            null, null, null, null, null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(0, result.getContent().size());
        assertEquals(0, result.getTotalElements());
        assertTrue(result.isEmpty());
    }

    @Test
    void list_Pagination_Success() {
        // Given
        InventoryTransaction transaction2 = new InventoryTransaction();
        transaction2.setTransactionId(UUID.randomUUID());
        transaction2.setProduct(testProduct);
        transaction2.setTransactionType("OUT");
        transaction2.setQuantity(50);
        transaction2.setTransactionDate(LocalDateTime.now());

        List<InventoryTransaction> transactions = Arrays.asList(testTransaction, transaction2);
        Page<InventoryTransaction> page = new PageImpl<>(
            transactions, 
            PageRequest.of(0, 10), 
            20  // Total elements
        );
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 10, "transactionDate", Sort.Direction.DESC, 
            null, null, null, null, null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals(20, result.getTotalElements());
        assertEquals(2, result.getTotalPages());
        assertTrue(result.isFirst());
        assertFalse(result.isLast());
    }

    @Test
    void list_WithMinimumPageSize_Success() {
        // Given
        List<InventoryTransaction> transactions = Arrays.asList(testTransaction);
        Page<InventoryTransaction> page = new PageImpl<>(transactions, PageRequest.of(0, 1), 1);
        
        when(transactionRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(page);
        when(mapper.toResponse(any(InventoryTransaction.class))).thenReturn(transactionResponse);

        // When - passing 0 as size should be converted to minimum 1
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
            0, 0, "transactionDate", Sort.Direction.DESC, 
            null, null, null, null, null, null, null
        );

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }
}
