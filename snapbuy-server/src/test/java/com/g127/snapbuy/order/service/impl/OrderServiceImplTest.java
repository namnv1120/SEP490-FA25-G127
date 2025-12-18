package com.g127.snapbuy.order.service.impl;

import com.g127.snapbuy.order.entity.Order;
import com.g127.snapbuy.order.entity.OrderDetail;
import com.g127.snapbuy.account.entity.Account;
import com.g127.snapbuy.customer.entity.Customer;
import com.g127.snapbuy.product.entity.Product;
import com.g127.snapbuy.product.entity.ProductPrice;
import com.g127.snapbuy.inventory.entity.Inventory;
import com.g127.snapbuy.payment.entity.Payment;
import com.g127.snapbuy.account.mapper.AccountMapper;
import com.g127.snapbuy.order.mapper.OrderMapper;
import com.g127.snapbuy.notification.service.NotificationSchedulerService;
import com.g127.snapbuy.order.dto.response.OrderResponse;
import com.g127.snapbuy.order.repository.OrderDetailRepository;
import com.g127.snapbuy.order.repository.OrderRepository;
import com.g127.snapbuy.payment.service.MoMoService;
import com.g127.snapbuy.promotion.service.PromotionService;
import com.g127.snapbuy.payment.repository.PaymentRepository;
import com.g127.snapbuy.product.repository.ProductRepository;
import com.g127.snapbuy.product.repository.ProductPriceRepository;
import com.g127.snapbuy.inventory.repository.InventoryRepository;
import com.g127.snapbuy.inventory.repository.InventoryTransactionRepository;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.customer.repository.CustomerRepository;
import com.g127.snapbuy.settings.repository.PosSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderDetailRepository orderDetailRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductPriceRepository productPriceRepository;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private AccountMapper accountMapper;

    @Mock
    private MoMoService moMoService;

    @Mock
    private PromotionService promotionService;

    @Mock
    private PosSettingsRepository posSettingsRepository;

    @Mock
    private NotificationSchedulerService notificationSchedulerService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Account testAccount;
    private Customer testCustomer;
    private Customer guestCustomer;
    private Product testProduct;
    private Inventory testInventory;
    private ProductPrice testProductPrice;
    private Order testOrder;
    private OrderDetail testOrderDetail;
    private Payment testPayment;
    private OrderResponse testOrderResponse;
    private UUID accountId;
    private UUID customerId;
    private UUID guestCustomerId;
    private UUID productId;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        accountId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        guestCustomerId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        productId = UUID.randomUUID();
        orderId = UUID.randomUUID();

        testAccount = new Account();
        testAccount.setAccountId(accountId);
        testAccount.setUsername("testuser");

        testCustomer = new Customer();
        testCustomer.setCustomerId(customerId);
        testCustomer.setPhone("0123456789");
        testCustomer.setCustomerCode("CUST001");
        testCustomer.setPoints(100);

        guestCustomer = new Customer();
        guestCustomer.setCustomerId(guestCustomerId);
        guestCustomer.setCustomerCode("GUEST");

        testProduct = new Product();
        testProduct.setProductId(productId);
        testProduct.setProductName("Test Product");
        testProduct.setActive(true);

        testInventory = new Inventory();
        testInventory.setInventoryId(UUID.randomUUID());
        testInventory.setProduct(testProduct);
        testInventory.setQuantityInStock(100);
        testInventory.setReorderPoint(10);

        testProductPrice = new ProductPrice();
        testProductPrice.setPriceId(UUID.randomUUID());
        testProductPrice.setProduct(testProduct);
        testProductPrice.setUnitPrice(BigDecimal.valueOf(100000));

        testOrder = new Order();
        testOrder.setOrderId(orderId);
        testOrder.setOrderNumber("ORD20231201001");
        testOrder.setAccount(testAccount);
        testOrder.setCustomer(testCustomer);
        testOrder.setOrderDate(LocalDateTime.now());
        testOrder.setOrderStatus("Chờ xác nhận");
        testOrder.setPaymentStatus("Chưa thanh toán");
        testOrder.setTotalAmount(BigDecimal.valueOf(100000));

        testOrderDetail = new OrderDetail();
        testOrderDetail.setOrderDetailId(UUID.randomUUID());
        testOrderDetail.setOrder(testOrder);
        testOrderDetail.setProduct(testProduct);
        testOrderDetail.setQuantity(1);
        testOrderDetail.setUnitPrice(BigDecimal.valueOf(100000));
        testOrderDetail.setDiscount(BigDecimal.ZERO);

        testPayment = new Payment();
        testPayment.setPaymentId(UUID.randomUUID());
        testPayment.setOrder(testOrder);
        testPayment.setPaymentMethod("Tiền mặt");
        testPayment.setAmount(BigDecimal.valueOf(100000));
        testPayment.setPaymentStatus("Chưa thanh toán");

        testOrderResponse = new OrderResponse();
        testOrderResponse.setOrderId(orderId);
        testOrderResponse.setOrderNumber("ORD20231201001");
        testOrderResponse.setTotalAmount(BigDecimal.valueOf(100000));

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getOrder_Success() {
        // Given
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(orderDetailRepository.findByOrder(testOrder)).thenReturn(Arrays.asList(testOrderDetail));
        when(paymentRepository.findByOrder_OrderId(orderId)).thenReturn(Arrays.asList(testPayment));
        when(orderMapper.toResponse(any(Order.class), anyList(), any(Payment.class), any(AccountMapper.class)))
                .thenReturn(testOrderResponse);

        // When
        OrderResponse result = orderService.getOrder(orderId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo(orderId);
        verify(orderRepository).findById(orderId);
    }

    @Test
    void getOrder_NotFound_ThrowsException() {
        // Given
        when(orderRepository.findById(orderId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> orderService.getOrder(orderId))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Không tìm thấy đơn hàng");
    }

    @Test
    void getAllOrders_Success() {
        // Given
        when(orderRepository.findAll()).thenReturn(Arrays.asList(testOrder));
        when(orderDetailRepository.findByOrderIdIn(anyList())).thenReturn(Arrays.asList(testOrderDetail));
        when(paymentRepository.findByOrderIdIn(anyList())).thenReturn(Arrays.asList(testPayment));
        when(orderMapper.toResponse(any(Order.class), anyList(), any(Payment.class), any(AccountMapper.class)))
                .thenReturn(testOrderResponse);

        // When
        List<OrderResponse> result = orderService.getAllOrders();

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(orderRepository).findAll();
    }

    @Test
    void cancelOrder_UnpaidOrder_Success() {
        // Given
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder_OrderId(orderId)).thenReturn(Arrays.asList(testPayment));
        when(orderDetailRepository.findByOrder(testOrder)).thenReturn(Arrays.asList(testOrderDetail));
        when(inventoryRepository.findByProduct(testProduct)).thenReturn(Optional.of(testInventory));
        when(orderMapper.toResponse(any(Order.class), anyList(), any(Payment.class), any(AccountMapper.class)))
                .thenReturn(testOrderResponse);

        // When
        OrderResponse result = orderService.cancelOrder(orderId);

        // Then
        assertThat(result).isNotNull();
        assertThat(testOrder.getOrderStatus()).isEqualTo("Đã hủy");
        assertThat(testOrder.getPaymentStatus()).isEqualTo("Thất bại");
        verify(orderRepository).save(testOrder);
        verify(paymentRepository).save(testPayment);
        verify(inventoryRepository).save(testInventory);
    }

    @Test
    void cancelOrder_AlreadyCancelled_ThrowsException() {
        // Given
        testOrder.setOrderStatus("Đã hủy");
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        // When & Then
        assertThatThrownBy(() -> orderService.cancelOrder(orderId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Đơn hàng đã ở trạng thái hủy");
    }

    @Test
    void completeOrder_Success() {
        // Given
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(paymentRepository.findByOrder_OrderId(orderId)).thenReturn(Arrays.asList(testPayment));
        when(orderDetailRepository.findByOrder(testOrder)).thenReturn(Arrays.asList(testOrderDetail));
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(new ArrayList<>());
        when(orderMapper.toResponse(any(Order.class), anyList(), any(Payment.class), any(AccountMapper.class)))
                .thenReturn(testOrderResponse);

        // When
        OrderResponse result = orderService.completeOrder(orderId);

        // Then
        assertThat(result).isNotNull();
        verify(orderRepository, atLeastOnce()).findById(orderId);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void completeOrder_CancelledOrder_ThrowsException() {
        // Given
        testOrder.setOrderStatus("Đã hủy");
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        // When & Then
        assertThatThrownBy(() -> orderService.completeOrder(orderId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Đơn hàng đã hủy");
    }

    @Test
    void markForReturn_Success() {
        // Given
        testOrder.setOrderStatus("Hoàn tất");
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(orderDetailRepository.findByOrder(testOrder)).thenReturn(Arrays.asList(testOrderDetail));
        when(paymentRepository.findByOrder_OrderId(orderId)).thenReturn(Arrays.asList(testPayment));
        when(orderMapper.toResponse(any(Order.class), anyList(), any(Payment.class), any(AccountMapper.class)))
                .thenReturn(testOrderResponse);

        // When
        OrderResponse result = orderService.markForReturn(orderId);

        // Then
        assertThat(result).isNotNull();
        assertThat(testOrder.getOrderStatus()).isEqualTo("Chờ hoàn hàng");
        verify(orderRepository).save(testOrder);
    }

    @Test
    void markForReturn_NotCompletedOrder_ThrowsException() {
        // Given
        testOrder.setOrderStatus("Chờ xác nhận");
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        // When & Then
        assertThatThrownBy(() -> orderService.markForReturn(orderId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Chỉ có thể đánh dấu hoàn hàng cho đơn đã hoàn tất");
    }

    @Test
    void revertReturnStatus_Success() {
        // Given
        testOrder.setOrderStatus("Chờ hoàn hàng");
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
        when(orderDetailRepository.findByOrder(testOrder)).thenReturn(Arrays.asList(testOrderDetail));
        when(paymentRepository.findByOrder_OrderId(orderId)).thenReturn(Arrays.asList(testPayment));
        when(orderMapper.toResponse(any(Order.class), anyList(), any(Payment.class), any(AccountMapper.class)))
                .thenReturn(testOrderResponse);

        // When
        OrderResponse result = orderService.revertReturnStatus(orderId);

        // Then
        assertThat(result).isNotNull();
        assertThat(testOrder.getOrderStatus()).isEqualTo("Hoàn tất");
        verify(orderRepository).save(testOrder);
    }

    @Test
    void revertReturnStatus_NotWaitingReturn_ThrowsException() {
        // Given
        testOrder.setOrderStatus("Hoàn tất");
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));

        // When & Then
        assertThatThrownBy(() -> orderService.revertReturnStatus(orderId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Chỉ có thể xóa phiếu hoàn hàng đang ở trạng thái chờ hoàn");
    }

    @Test
    void getMyTodayOrderCount_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(orderRepository.countOrdersByAccountAndDateRange(
                eq(accountId), any(LocalDateTime.class), any(LocalDateTime.class), eq("Đã thanh toán")))
                .thenReturn(5L);

        // When
        Long count = orderService.getMyTodayOrderCount("Đã thanh toán");

        // Then
        assertThat(count).isEqualTo(5L);
        verify(orderRepository).countOrdersByAccountAndDateRange(
                eq(accountId), any(LocalDateTime.class), any(LocalDateTime.class), eq("Đã thanh toán"));
    }

    @Test
    void getMyTodayRevenue_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(orderRepository.sumRevenueByAccountAndDateRange(
                eq(accountId), any(LocalDateTime.class), any(LocalDateTime.class), eq("Đã thanh toán")))
                .thenReturn(BigDecimal.valueOf(1000000));

        // When
        BigDecimal revenue = orderService.getMyTodayRevenue("Đã thanh toán");

        // Then
        assertThat(revenue).isEqualTo(BigDecimal.valueOf(1000000));
        verify(orderRepository).sumRevenueByAccountAndDateRange(
                eq(accountId), any(LocalDateTime.class), any(LocalDateTime.class), eq("Đã thanh toán"));
    }

    @Test
    void getMyOrdersByDateTimeRange_Success() {
        // Given
        LocalDateTime from = LocalDateTime.now().minusDays(7);
        LocalDateTime to = LocalDateTime.now();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(orderRepository.findByAccountAndOrderDateBetween(accountId, from, to))
                .thenReturn(Arrays.asList(testOrder));
        when(orderDetailRepository.findByOrder(testOrder)).thenReturn(Arrays.asList(testOrderDetail));
        when(paymentRepository.findByOrder_OrderId(orderId)).thenReturn(Arrays.asList(testPayment));
        when(orderMapper.toResponse(any(Order.class), anyList(), any(Payment.class), any(AccountMapper.class)))
                .thenReturn(testOrderResponse);

        // When
        List<OrderResponse> result = orderService.getMyOrdersByDateTimeRange(from, to);

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(orderRepository).findByAccountAndOrderDateBetween(accountId, from, to);
    }

    @Test
    void cancelOrderByReference_Success() {
        // Given
        String transactionReference = "REF123456";
        testPayment.setTransactionReference(transactionReference);

        when(paymentRepository.findByTransactionReference(transactionReference))
                .thenReturn(Optional.of(testPayment));
        when(orderDetailRepository.findByOrder(testOrder)).thenReturn(Arrays.asList(testOrderDetail));
        when(inventoryRepository.findByProduct(testProduct)).thenReturn(Optional.of(testInventory));

        // When
        orderService.cancelOrderByReference(transactionReference);

        // Then
        assertThat(testOrder.getOrderStatus()).isEqualTo("Đã hủy");
        assertThat(testOrder.getPaymentStatus()).isEqualTo("Thất bại");
        verify(orderRepository).save(testOrder);
        verify(paymentRepository).save(testPayment);
    }

    @Test
    void cancelOrderByReference_NotFound_ThrowsException() {
        // Given
        String transactionReference = "INVALID_REF";
        when(paymentRepository.findByTransactionReference(transactionReference))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> orderService.cancelOrderByReference(transactionReference))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessageContaining("Không tìm thấy thanh toán với reference");
    }
}
