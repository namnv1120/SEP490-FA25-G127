package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.*;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.mapper.OrderMapper;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.OrderService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final OrderMapper orderMapper;


    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest req) {
        Account creator = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        Customer customer = null;
        if (req.getCustomerId() != null) {
            customer = customerRepository.findById(req.getCustomerId())
                    .orElseThrow(() -> new NoSuchElementException("Customer not found"));
        }

        String orderNumber = generateOrderNumber();

        Order order = new Order();
        order.setOrderId(UUID.randomUUID());
        order.setOrderNumber(orderNumber);
        order.setAccount(creator);
        order.setCustomer(customer);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus("PENDING");
        order.setPaymentStatus("UNPAID");
        order.setDiscountAmount(req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO);
        order.setTaxAmount(req.getTaxAmount() != null ? req.getTaxAmount() : BigDecimal.ZERO);
        order.setNotes(req.getNotes());
        order.setCreatedBy(creator.getFullName());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (OrderDetailRequest item : req.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Product not found"));

            BigDecimal discount = item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO;
            BigDecimal itemTotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .multiply(BigDecimal.ONE.subtract(discount.divide(BigDecimal.valueOf(100))));

            total = total.add(itemTotal);

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(item.getUnitPrice());
            detail.setDiscount(discount);
            orderDetails.add(detail);

            adjustInventory(product, item.getQuantity() * -1, creator);
        }

        order.setTotalAmount(total);
        orderRepository.save(order);
        orderDetailRepository.saveAll(orderDetails);

        if (req.getPaymentMethod() != null && total.compareTo(BigDecimal.ZERO) > 0) {
            Payment payment = new Payment();
            payment.setPaymentId(UUID.randomUUID());
            payment.setOrder(order);
            payment.setPaymentMethod(req.getPaymentMethod());
            payment.setAmount(total);
            payment.setPaymentStatus("SUCCESS");
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);

            order.setPaymentStatus("PAID");
        }

        orderRepository.save(order);

        return orderMapper.toResponse(order, orderDetails, paymentRepository.findByOrder(order));
    }


    @Override
    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        List<Payment> payments = paymentRepository.findByOrder(order);
        return orderMapper.toResponse(order, details, payments);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> orderMapper.toResponse(
                        order,
                        orderDetailRepository.findByOrder(order),
                        paymentRepository.findByOrder(order)))
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public PaymentResponse addPayment(PaymentRequest req) {
        Order order = orderRepository.findById(req.getOrderId())
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        Payment payment = new Payment();
        payment.setPaymentId(UUID.randomUUID());
        payment.setOrder(order);
        payment.setPaymentMethod(req.getPaymentMethod());
        payment.setAmount(req.getAmount());
        payment.setPaymentStatus("SUCCESS");
        payment.setTransactionReference(req.getTransactionReference());
        payment.setNotes(req.getNotes());
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        BigDecimal totalPaid = paymentRepository.findByOrder(order).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(order.getTotalAmount()) >= 0) {
            order.setPaymentStatus("PAID");
        } else {
            order.setPaymentStatus("PARTIAL");
        }

        orderRepository.save(order);

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .transactionReference(payment.getTransactionReference())
                .notes(payment.getNotes())
                .build();
    }

    @Override
    @Transactional
    public void cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalStateException("Order already cancelled");
        }

        // Hoàn tồn kho
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail d : details) {
            adjustInventory(d.getProduct(), d.getQuantity(), order.getAccount());
        }

        order.setOrderStatus("CANCELLED");
        orderRepository.save(order);
    }

    private String generateOrderNumber() {
        long count = orderRepository.count() + 1;
        return String.format("ORD-%05d", count);
    }

    private void adjustInventory(Product product, int quantityChange, Account account) {
        Inventory inv = inventoryRepository.findByProduct(product)
                .orElseThrow(() -> new NoSuchElementException("Inventory not found for product: " + product.getProductName()));

        inv.setQuantityInStock(inv.getQuantityInStock() + quantityChange);
        inv.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inv);

        InventoryTransaction trx = new InventoryTransaction();
        trx.setTransactionId(UUID.randomUUID());
        trx.setProduct(product);
        trx.setAccount(account);
        trx.setTransactionType(quantityChange < 0 ? "SALE_OUT" : "SALE_CANCEL");
        trx.setQuantity(Math.abs(quantityChange));
        trx.setTransactionDate(LocalDateTime.now());
        trx.setCreatedBy(account.getFullName());
        inventoryTransactionRepository.save(trx);
    }

    @Override
    public void holdOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus("HOLD");
        orderRepository.save(order);
    }

    @Override
    public void completeOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus("COMPLETED");
        orderRepository.save(order);
    }


}
