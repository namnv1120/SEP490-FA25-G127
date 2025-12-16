package com.g127.snapbuy.payment.service.impl;

import com.g127.snapbuy.payment.dto.request.PaymentRequest;
import com.g127.snapbuy.payment.dto.response.MomoPaymentResponse;
import com.g127.snapbuy.payment.dto.response.PaymentResponse;
import com.g127.snapbuy.order.entity.Order;
import com.g127.snapbuy.payment.entity.Payment;
import com.g127.snapbuy.payment.service.MoMoService;
import com.g127.snapbuy.order.repository.OrderRepository;
import com.g127.snapbuy.payment.repository.PaymentRepository;
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
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private MoMoService moMoService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Order testOrder;
    private Payment testPayment;
    private UUID orderId;
    private UUID paymentId;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        paymentId = UUID.randomUUID();

        testOrder = new Order();
        testOrder.setOrderId(orderId);
        testOrder.setPaymentStatus("Chưa thanh toán");
        testOrder.setOrderStatus("Đang xử lý");

        testPayment = new Payment();
        testPayment.setPaymentId(paymentId);
        testPayment.setOrder(testOrder);
        testPayment.setPaymentMethod("Tiền mặt");
        testPayment.setAmount(BigDecimal.valueOf(500000));
        testPayment.setPaymentStatus("Chưa thanh toán");
    }

    @Test
    void createPayment_Cash_Success() {
        // Given
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(orderId);
        request.setPaymentMethod("Tiền mặt");
        request.setAmount(BigDecimal.valueOf(500000));

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        PaymentResponse result = paymentService.createPayment(request);

        // Then
        assertNotNull(result);
        verify(paymentRepository).save(any(Payment.class));
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void createPayment_MoMo_Success() {
        // Given
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(orderId);
        request.setPaymentMethod("MOMO");
        request.setAmount(BigDecimal.valueOf(500000));

        MomoPaymentResponse momoResponse = new MomoPaymentResponse();
        momoResponse.setRequestId("MOMO123");
        momoResponse.setPayUrl("https://momo.vn/pay/123");

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(moMoService.createPayment(orderId)).thenReturn(momoResponse);
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        PaymentResponse result = paymentService.createPayment(request);

        // Then
        assertNotNull(result);
        verify(moMoService).createPayment(orderId);
        verify(paymentRepository).save(argThat(payment ->
            "MOMO123".equals(payment.getTransactionReference())
        ));
    }

    @Test
    void createPayment_OrderNotFound_ThrowsException() {
        // Given
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(orderId);
        request.setAmount(BigDecimal.valueOf(500000));

        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class,
            () -> paymentService.createPayment(request));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void createPayment_InvalidAmount_ThrowsException() {
        // Given
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(orderId);
        request.setAmount(BigDecimal.ZERO);

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> paymentService.createPayment(request));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void createPayment_NegativeAmount_ThrowsException() {
        // Given
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(orderId);
        request.setAmount(BigDecimal.valueOf(-100));

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> paymentService.createPayment(request));
    }

    @Test
    void finalizePayment_Success() {
        // Given
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        PaymentResponse result = paymentService.finalizePayment(paymentId);

        // Then
        assertNotNull(result);
        verify(paymentRepository).save(argThat(payment ->
            "Đã thanh toán".equals(payment.getPaymentStatus())
        ));
        verify(orderRepository).save(argThat(order ->
            "Đã thanh toán".equals(order.getPaymentStatus()) &&
            "Hoàn tất".equals(order.getOrderStatus())
        ));
    }

    @Test
    void finalizePayment_NotFound_ThrowsException() {
        // Given
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class,
            () -> paymentService.finalizePayment(paymentId));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void refundPayment_Success() {
        // Given
        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        PaymentResponse result = paymentService.refundPayment(paymentId);

        // Then
        assertNotNull(result);
        verify(paymentRepository).save(argThat(payment ->
            "Đã hoàn tiền".equals(payment.getPaymentStatus())
        ));
        verify(orderRepository).save(argThat(order ->
            "Đã hoàn tiền".equals(order.getPaymentStatus())
        ));
    }

    @Test
    void getPaymentsByOrder_Success() {
        // Given
        List<Payment> payments = Arrays.asList(testPayment);
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder_OrderId(orderId)).thenReturn(payments);

        // When
        List<PaymentResponse> result = paymentService.getPaymentsByOrder(orderId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getPaymentsByOrder_NoPayments_ReturnsEmptyList() {
        // Given
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder_OrderId(orderId)).thenReturn(Collections.emptyList());

        // When
        List<PaymentResponse> result = paymentService.getPaymentsByOrder(orderId);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getPaymentsByOrder_OrderNotFound_ThrowsException() {
        // Given
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class,
            () -> paymentService.getPaymentsByOrder(orderId));
    }

    @Test
    void finalizePaymentByReference_Success() {
        // Given
        String momoRequestId = "MOMO123";
        testPayment.setTransactionReference(momoRequestId);

        when(paymentRepository.findByTransactionReference(momoRequestId))
            .thenReturn(Optional.of(testPayment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        paymentService.finalizePaymentByReference(momoRequestId);

        // Then
        verify(paymentRepository).save(argThat(payment ->
            "Đã thanh toán".equals(payment.getPaymentStatus())
        ));
        verify(orderRepository).save(argThat(order ->
            "Đã thanh toán".equals(order.getPaymentStatus())
        ));
    }

    @Test
    void finalizePaymentByReference_NotFound_ThrowsException() {
        // Given
        String momoRequestId = "MOMO123";
        when(paymentRepository.findByTransactionReference(momoRequestId))
            .thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class,
            () -> paymentService.finalizePaymentByReference(momoRequestId));
    }

    @Test
    void createPayment_MoMoError_SavesWithErrorNote() {
        // Given
        PaymentRequest request = new PaymentRequest();
        request.setOrderId(orderId);
        request.setPaymentMethod("MOMO");
        request.setAmount(BigDecimal.valueOf(500000));

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(moMoService.createPayment(orderId)).thenThrow(new RuntimeException("MoMo API Error"));
        when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);
        when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

        // When
        PaymentResponse result = paymentService.createPayment(request);

        // Then
        assertNotNull(result);
        verify(paymentRepository).save(argThat(payment ->
            payment.getNotes() != null && payment.getNotes().contains("Lỗi MoMo")
        ));
    }
}
