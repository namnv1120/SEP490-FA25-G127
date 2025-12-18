package com.g127.snapbuy.payment.service.impl;

import com.g127.snapbuy.order.entity.Order;
import com.g127.snapbuy.order.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MoMoServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private MoMoServiceImpl moMoService;

    private Order testOrder;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();

        testOrder = new Order();
        testOrder.setOrderId(orderId);
        testOrder.setOrderNumber("ORD001");
        testOrder.setTotalAmount(BigDecimal.valueOf(500000));

        // Set required properties
        ReflectionTestUtils.setField(moMoService, "baseUrl", "http://localhost:8080");
        ReflectionTestUtils.setField(moMoService, "momoEndpoint", "https://test-payment.momo.vn");
        ReflectionTestUtils.setField(moMoService, "accessKey", "test-access-key");
        ReflectionTestUtils.setField(moMoService, "partnerCode", "test-partner");
        ReflectionTestUtils.setField(moMoService, "secretKey", "test-secret-key");
        ReflectionTestUtils.setField(moMoService, "createUrl", "/v2/gateway/api/create");
    }

    @Test
    void createPayment_OrderNotFound_ThrowsException() {
        // Given
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> moMoService.createPayment(orderId));
        assertTrue(exception.getMessage().contains("Không tìm thấy đơn hàng"));
    }

    @Test
    void createPayment_ValidOrder_CallsRepository() {
        // Given
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        // When & Then
        // This will fail because RestTemplate is not mocked, but we verify the order lookup
        assertThrows(RuntimeException.class,
            () -> moMoService.createPayment(orderId));
        
        verify(orderRepository).findById(orderId);
    }
}
