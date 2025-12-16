package com.g127.snapbuy.customer.service.impl;

import com.g127.snapbuy.customer.dto.request.CustomerCreateRequest;
import com.g127.snapbuy.customer.dto.request.CustomerUpdateRequest;
import com.g127.snapbuy.customer.dto.response.CustomerResponse;
import com.g127.snapbuy.entity.Customer;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.mapper.CustomerMapper;
import com.g127.snapbuy.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceImplTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMapper customerMapper;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer testCustomer;
    private CustomerCreateRequest createRequest;
    private CustomerUpdateRequest updateRequest;
    private CustomerResponse customerResponse;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setCustomerId(UUID.randomUUID());
        testCustomer.setCustomerCode("CUS20250101001");
        testCustomer.setFullName("Test Customer");
        testCustomer.setPhone("0123456789");
        testCustomer.setPoints(100);
        testCustomer.setActive(true);
        testCustomer.setCreatedDate(LocalDateTime.now());

        createRequest = new CustomerCreateRequest();
        createRequest.setFullName("New Customer");
        createRequest.setPhone("0987654321");

        updateRequest = new CustomerUpdateRequest();
        updateRequest.setFullName("Updated Customer");
        updateRequest.setPhone("0111111111");

        customerResponse = CustomerResponse.builder()
                .customerId(testCustomer.getCustomerId())
                .customerCode(testCustomer.getCustomerCode())
                .fullName(testCustomer.getFullName())
                .phone(testCustomer.getPhone())
                .points(testCustomer.getPoints())
                .active(testCustomer.getActive())
                .build();
    }

    @Test
    void createCustomer_Success() {
        // Given
        when(customerRepository.getCustomerByPhone(anyString())).thenReturn(null);
        when(customerMapper.toEntity(any(CustomerCreateRequest.class))).thenReturn(testCustomer);
        when(customerRepository.countByCreatedDateBetween(any(), any())).thenReturn(0L);
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        CustomerResponse result = customerService.createCustomer(createRequest);

        // Then
        assertNotNull(result);
        assertEquals(customerResponse.getFullName(), result.getFullName());
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void createCustomer_PhoneExists_ThrowsException() {
        // Given
        createRequest.setPhone("0123456789");
        when(customerRepository.getCustomerByPhone(anyString())).thenReturn(testCustomer);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> customerService.createCustomer(createRequest));
        assertEquals(ErrorCode.PHONE_EXISTED, exception.getErrorCode());
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void createCustomer_WithoutPhone_Success() {
        // Given
        createRequest.setPhone(null);
        when(customerMapper.toEntity(any(CustomerCreateRequest.class))).thenReturn(testCustomer);
        when(customerRepository.countByCreatedDateBetween(any(), any())).thenReturn(0L);
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        CustomerResponse result = customerService.createCustomer(createRequest);

        // Then
        assertNotNull(result);
        verify(customerRepository, never()).getCustomerByPhone(anyString());
    }

    @Test
    void createCustomer_EmptyPhone_Success() {
        // Given
        createRequest.setPhone("   ");
        when(customerMapper.toEntity(any(CustomerCreateRequest.class))).thenReturn(testCustomer);
        when(customerRepository.countByCreatedDateBetween(any(), any())).thenReturn(0L);
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        CustomerResponse result = customerService.createCustomer(createRequest);

        // Then
        assertNotNull(result);
        verify(customerRepository, never()).getCustomerByPhone(anyString());
    }

    @Test
    void createCustomer_GeneratesCustomerCode() {
        // Given
        when(customerRepository.getCustomerByPhone(anyString())).thenReturn(null);
        when(customerMapper.toEntity(any(CustomerCreateRequest.class))).thenReturn(testCustomer);
        when(customerRepository.countByCreatedDateBetween(any(), any())).thenReturn(5L);
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        CustomerResponse result = customerService.createCustomer(createRequest);

        // Then
        assertNotNull(result);
        verify(customerRepository).countByCreatedDateBetween(any(), any());
    }

    @Test
    void getCustomerById_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        CustomerResponse result = customerService.getCustomerById(customerId);

        // Then
        assertNotNull(result);
        assertEquals(customerResponse.getFullName(), result.getFullName());
    }

    @Test
    void getCustomerById_NotFound_ThrowsException() {
        // Given
        UUID customerId = UUID.randomUUID();
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> customerService.getCustomerById(customerId));
        assertEquals(ErrorCode.CUSTOMER_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getAllCustomers_Success() {
        // Given
        List<Customer> customers = Arrays.asList(testCustomer);
        when(customerRepository.findAll()).thenReturn(customers);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        List<CustomerResponse> result = customerService.getAllCustomers();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAllCustomers_EmptyList_ReturnsEmptyList() {
        // Given
        when(customerRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<CustomerResponse> result = customerService.getAllCustomers();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void updateCustomer_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.getCustomerByPhone(anyString())).thenReturn(null);
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        CustomerResponse result = customerService.updateCustomer(customerId, updateRequest);

        // Then
        assertNotNull(result);
        verify(customerMapper).updateFromDto(any(CustomerUpdateRequest.class), any(Customer.class));
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void updateCustomer_PhoneExistsForOtherCustomer_ThrowsException() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        Customer otherCustomer = new Customer();
        otherCustomer.setCustomerId(UUID.randomUUID());
        
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.getCustomerByPhone(anyString())).thenReturn(otherCustomer);

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> customerService.updateCustomer(customerId, updateRequest));
        assertEquals(ErrorCode.PHONE_EXISTED, exception.getErrorCode());
    }

    @Test
    void updateCustomer_SamePhone_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        updateRequest.setPhone("0123456789"); // Same as testCustomer
        
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.getCustomerByPhone(anyString())).thenReturn(testCustomer);
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        CustomerResponse result = customerService.updateCustomer(customerId, updateRequest);

        // Then
        assertNotNull(result);
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void deleteCustomer_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));

        // When
        customerService.deleteCustomer(customerId);

        // Then
        verify(customerRepository).delete(testCustomer);
    }

    @Test
    void deleteCustomer_NotFound_ThrowsException() {
        // Given
        UUID customerId = UUID.randomUUID();
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> customerService.deleteCustomer(customerId));
        assertEquals(ErrorCode.CUSTOMER_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void searchCustomer_Success() {
        // Given
        String keyword = "test";
        List<Customer> customers = Arrays.asList(testCustomer);
        when(customerRepository.searchByKeyword(keyword)).thenReturn(customers);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        List<CustomerResponse> result = customerService.searchCustomer(keyword);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getCustomerByPhone_Success() {
        // Given
        String phone = "0123456789";
        when(customerRepository.getCustomerByPhone(phone)).thenReturn(testCustomer);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        CustomerResponse result = customerService.getCustomerByPhone(phone);

        // Then
        assertNotNull(result);
        assertEquals(customerResponse.getPhone(), result.getPhone());
    }

    @Test
    void getCustomerByPhone_NotFound_ReturnsNull() {
        // Given
        String phone = "0000000000";
        when(customerRepository.getCustomerByPhone(phone)).thenReturn(null);
        when(customerMapper.toResponse(null)).thenReturn(null);

        // When
        CustomerResponse result = customerService.getCustomerByPhone(phone);

        // Then
        assertNull(result);
    }

    @Test
    void normalizeRedeem_ValidRequest_ReturnsNormalizedPoints() {
        // Given
        int requestedPoints = 100;
        int currentPoints = 200;
        BigDecimal payable = new BigDecimal("150");

        // When
        int result = customerService.normalizeRedeem(requestedPoints, currentPoints, payable);

        // Then
        assertEquals(100, result); // Min of (100, 200, 150)
    }

    @Test
    void normalizeRedeem_RequestedMoreThanCurrent_ReturnsCurrentPoints() {
        // Given
        int requestedPoints = 300;
        int currentPoints = 200;
        BigDecimal payable = new BigDecimal("500");

        // When
        int result = customerService.normalizeRedeem(requestedPoints, currentPoints, payable);

        // Then
        assertEquals(200, result);
    }

    @Test
    void normalizeRedeem_RequestedMoreThanPayable_ReturnsPayableAmount() {
        // Given
        int requestedPoints = 300;
        int currentPoints = 500;
        BigDecimal payable = new BigDecimal("100");

        // When
        int result = customerService.normalizeRedeem(requestedPoints, currentPoints, payable);

        // Then
        assertEquals(100, result);
    }

    @Test
    void normalizeRedeem_NegativeRequested_ReturnsZero() {
        // Given
        int requestedPoints = -50;
        int currentPoints = 200;
        BigDecimal payable = new BigDecimal("150");

        // When
        int result = customerService.normalizeRedeem(requestedPoints, currentPoints, payable);

        // Then
        assertEquals(0, result);
    }

    @Test
    void earnFromPayable_ValidAmount_ReturnsCorrectPoints() {
        // Given
        BigDecimal payable = new BigDecimal("1000");

        // When
        int result = customerService.earnFromPayable(payable);

        // Then
        assertEquals(2, result); // 1000 / 500 = 2
    }

    @Test
    void earnFromPayable_SmallAmount_ReturnsZero() {
        // Given
        BigDecimal payable = new BigDecimal("400");

        // When
        int result = customerService.earnFromPayable(payable);

        // Then
        assertEquals(0, result); // 400 / 500 = 0 (floor)
    }

    @Test
    void earnFromPayable_NullAmount_ReturnsZero() {
        // Given
        BigDecimal payable = null;

        // When
        int result = customerService.earnFromPayable(payable);

        // Then
        assertEquals(0, result);
    }

    @Test
    void earnFromPayable_NegativeAmount_ReturnsZero() {
        // Given
        BigDecimal payable = new BigDecimal("-100");

        // When
        int result = customerService.earnFromPayable(payable);

        // Then
        assertEquals(0, result);
    }

    @Test
    void getPoints_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));

        // When
        int result = customerService.getPoints(customerId);

        // Then
        assertEquals(100, result);
    }

    @Test
    void getPoints_NullPoints_ReturnsZero() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        testCustomer.setPoints(null);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));

        // When
        int result = customerService.getPoints(customerId);

        // Then
        assertEquals(0, result);
    }

    @Test
    void getPoints_NotFound_ThrowsException() {
        // Given
        UUID customerId = UUID.randomUUID();
        when(customerRepository.findById(customerId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, 
            () -> customerService.getPoints(customerId));
        assertEquals(ErrorCode.CUSTOMER_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void adjustPoints_AddPoints_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        int delta = 50;
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // When
        int result = customerService.adjustPoints(customerId, delta);

        // Then
        assertEquals(150, result);
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void adjustPoints_SubtractPoints_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        int delta = -50;
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // When
        int result = customerService.adjustPoints(customerId, delta);

        // Then
        assertEquals(50, result);
    }

    @Test
    void adjustPoints_SubtractMoreThanCurrent_ReturnsZero() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        int delta = -200;
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // When
        int result = customerService.adjustPoints(customerId, delta);

        // Then
        assertEquals(0, result);
    }

    @Test
    void getCustomersByPoints_Success() {
        // Given
        Integer min = 50;
        Integer max = 150;
        String sort = "desc";
        List<Customer> customers = Arrays.asList(testCustomer);
        
        when(customerRepository.findByPointsBetween(anyInt(), anyInt(), any(Sort.class)))
            .thenReturn(customers);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        List<CustomerResponse> result = customerService.getCustomersByPoints(min, max, sort);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(customerRepository).findByPointsBetween(eq(50), eq(150), any(Sort.class));
    }

    @Test
    void getCustomersByPoints_NullMinMax_UsesDefaults() {
        // Given
        List<Customer> customers = Arrays.asList(testCustomer);
        when(customerRepository.findByPointsBetween(anyInt(), anyInt(), any(Sort.class)))
            .thenReturn(customers);
        when(customerMapper.toResponse(any(Customer.class))).thenReturn(customerResponse);

        // When
        List<CustomerResponse> result = customerService.getCustomersByPoints(null, null, "asc");

        // Then
        assertNotNull(result);
        verify(customerRepository).findByPointsBetween(eq(0), eq(Integer.MAX_VALUE), any(Sort.class));
    }

    @Test
    void toggleCustomerStatus_ActivateCustomer_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        testCustomer.setActive(false);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // When
        customerService.toggleCustomerStatus(customerId);

        // Then
        verify(customerRepository).save(argThat(customer -> customer.getActive()));
    }

    @Test
    void toggleCustomerStatus_DeactivateCustomer_Success() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        testCustomer.setActive(true);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // When
        customerService.toggleCustomerStatus(customerId);

        // Then
        verify(customerRepository).save(argThat(customer -> !customer.getActive()));
    }

    @Test
    void toggleCustomerStatus_NullActive_ActivatesCustomer() {
        // Given
        UUID customerId = testCustomer.getCustomerId();
        testCustomer.setActive(null);
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        // When
        customerService.toggleCustomerStatus(customerId);

        // Then
        verify(customerRepository).save(argThat(customer -> !customer.getActive()));
    }
}
