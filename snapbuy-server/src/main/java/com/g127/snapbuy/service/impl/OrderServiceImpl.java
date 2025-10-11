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
    private final ProductPriceRepository productPriceRepository;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest req) {

        if (req.getAccountId() == null)
            throw new IllegalArgumentException("accountId is required");
        if (req.getCustomerId() == null)
            throw new IllegalArgumentException("customerId is required");
        if (req.getItems() == null || req.getItems().isEmpty())
            throw new IllegalArgumentException("Order must contain at least 1 item");

        Account creator = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new NoSuchElementException("Customer not found"));

        String orderNumber = generateOrderNumber();

        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setAccount(creator);
        order.setCustomer(customer);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus("PENDING");
        order.setPaymentStatus("UNPAID");
        order.setNotes(req.getNotes());
        order.setCreatedDate(LocalDateTime.now());
        order.setUpdatedDate(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (OrderDetailRequest item : req.getItems()) {

            if (item.getProductId() == null)
                throw new IllegalArgumentException("productId is required for each item");
            if (item.getQuantity() == null || item.getQuantity() <= 0)
                throw new IllegalArgumentException("quantity must be > 0");

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Product not found"));

            BigDecimal unitPrice = item.getUnitPrice();
            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                ProductPrice price = productPriceRepository.findCurrentPriceByProductId(product.getProductId())
                        .orElseThrow(() -> new NoSuchElementException(
                                "No active price found for product: " + product.getProductName()));
                unitPrice = price.getUnitPrice();
                log.info("Auto-loaded price {} for product {}", unitPrice, product.getProductName());
            }

            if (unitPrice.compareTo(BigDecimal.ZERO) <= 0)
                throw new IllegalArgumentException("Unit price must be greater than 0");

            BigDecimal discountPercent = item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO;
            if (discountPercent.compareTo(BigDecimal.ZERO) < 0 || discountPercent.compareTo(BigDecimal.valueOf(100)) > 0)
                throw new IllegalArgumentException("Discount must be between 0 and 100 percent");

            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                    discountPercent.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP));

            BigDecimal itemTotal = unitPrice
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .multiply(discountMultiplier);

            total = total.add(itemTotal);

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(unitPrice);
            detail.setDiscount(discountPercent);
            orderDetails.add(detail);

            adjustInventory(product, -item.getQuantity(), creator);
        }

        BigDecimal billDiscountPercent = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
        if (billDiscountPercent.compareTo(BigDecimal.ZERO) < 0 || billDiscountPercent.compareTo(BigDecimal.valueOf(100)) > 0)
            throw new IllegalArgumentException("Order-level discount must be between 0 and 100 percent");

        BigDecimal billDiscountAmount = total.multiply(
                billDiscountPercent.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP)
        );
        BigDecimal afterDiscount = total.subtract(billDiscountAmount);

        BigDecimal taxPercent = req.getTaxAmount() != null ? req.getTaxAmount() : BigDecimal.ZERO;
        if (taxPercent.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("Tax must be non-negative");

        BigDecimal taxAmount = afterDiscount.multiply(
                taxPercent.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP)
        );

        BigDecimal grandTotal = afterDiscount.add(taxAmount);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) grandTotal = BigDecimal.ZERO;

        order.setDiscountAmount(billDiscountAmount);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(grandTotal);

        orderRepository.save(order);
        orderDetailRepository.saveAll(orderDetails);

        // ✅ Tự tạo thanh toán nếu có
        if (req.getPaymentMethod() != null && grandTotal.compareTo(BigDecimal.ZERO) > 0) {
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setPaymentMethod(req.getPaymentMethod());
            payment.setAmount(grandTotal);
            payment.setPaymentStatus("SUCCESS");
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);
            order.setPaymentStatus("PAID");
        }

        order.setUpdatedDate(LocalDateTime.now());

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

        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Payment amount must be > 0");

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(req.getPaymentMethod());
        payment.setAmount(req.getAmount());
        payment.setPaymentStatus("SUCCESS");
        payment.setTransactionReference(req.getTransactionReference());
        payment.setNotes(req.getNotes());
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setPaymentStatus("PAID");
        order.setOrderStatus("COMPLETED");
        order.setUpdatedDate(LocalDateTime.now());
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

        if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus()))
            throw new IllegalStateException("Order already cancelled");

        if ("UNPAID".equalsIgnoreCase(order.getPaymentStatus())) {
            order.setPaymentStatus("UNPAID");
        }
        else if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            order.setPaymentStatus("REFUNDED");
        }

        order.setOrderStatus("CANCELLED");
        order.setUpdatedDate(LocalDateTime.now());

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail d : details) {
            adjustInventory(d.getProduct(), d.getQuantity(), order.getAccount());
        }

        orderRepository.save(order);
    }


    private String generateOrderNumber() {
        long count = orderRepository.count() + 1;
        return String.format("ORD-%05d", count);
    }

    private void adjustInventory(Product product, int quantityChange, Account account) {
        Inventory inv = inventoryRepository.findByProduct(product)
                .orElseThrow(() -> new NoSuchElementException(
                        "Inventory not found for product: " + product.getProductName()));

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
        inventoryTransactionRepository.save(trx);
    }

    @Override
    @Transactional
    public void holdOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus("HOLD");
        order.setUpdatedDate(LocalDateTime.now());
    }

    @Override
    @Transactional
    public void completeOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus("COMPLETED");
        order.setUpdatedDate(LocalDateTime.now());
    }
}
