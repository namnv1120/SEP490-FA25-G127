package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.*;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.OrderMapper;
import com.g127.snapbuy.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements com.g127.snapbuy.service.OrderService {

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
        if (req.getAccountId() == null) {
            throw new IllegalArgumentException("accountId is required");
        }
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least 1 item");
        }

        Account creator = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new NoSuchElementException("Account not found"));

        Customer customer;
        if (req.getCustomerId() == null) {
            UUID defaultCustomerId = UUID.fromString("00000000-0000-0000-0000-000000000001");
            customer = customerRepository.findById(defaultCustomerId)
                    .orElseThrow(() -> new NoSuchElementException("Default walk-in customer not found"));
        } else {
            customer = customerRepository.findById(req.getCustomerId())
                    .orElseThrow(() -> new NoSuchElementException("Customer not found"));
        }

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
            if (item.getProductId() == null) {
                throw new IllegalArgumentException("productId is required for each item");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("quantity must be > 0");
            }

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Product not found"));

            Inventory inv = inventoryRepository.findByProduct(product)
                    .orElseThrow(() -> new NoSuchElementException(
                            "Inventory not found for product: " + product.getProductName()));

            if (inv.getQuantityInStock() < item.getQuantity()) {
                throw new AppException(ErrorCode.INVALID_STOCK_OPERATION);
            }

            BigDecimal unitPrice = item.getUnitPrice();
            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                ProductPrice price = productPriceRepository.findCurrentPriceByProductId(product.getProductId())
                        .orElseThrow(() -> new NoSuchElementException(
                                "No active price found for product: " + product.getProductName()));
                unitPrice = price.getUnitPrice();
            }

            BigDecimal discountPercent = item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO;
            if (discountPercent.compareTo(BigDecimal.ZERO) < 0
                    || discountPercent.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("Discount must be between 0 and 100 percent");
            }

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
        BigDecimal billDiscountAmount = total.multiply(
                billDiscountPercent.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP)
        );
        BigDecimal afterDiscount = total.subtract(billDiscountAmount);

        BigDecimal taxPercent = req.getTaxAmount() != null ? req.getTaxAmount() : BigDecimal.ZERO;
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

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod(Optional.ofNullable(req.getPaymentMethod()).orElse("CASH"));
        payment.setAmount(grandTotal);
        payment.setPaymentStatus("UNPAID");
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);
        orderRepository.save(order);

        return orderMapper.toResponse(order, orderDetails, payment);
    }

    @Override
    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        Payment payment = paymentRepository.findByOrder(order);
        return orderMapper.toResponse(order, details, payment);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> {
                    List<OrderDetail> details = orderDetailRepository.findByOrder(order);
                    Payment payment = paymentRepository.findByOrder(order);
                    return orderMapper.toResponse(order, details, payment);
                })
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        Payment payment = paymentRepository.findByOrder(order);
        if (payment == null) throw new NoSuchElementException("Payment not found for order");

        if ("UNPAID".equalsIgnoreCase(order.getPaymentStatus())) {
            order.setOrderStatus("CANCELLED");
            order.setPaymentStatus("UNPAID");
            payment.setPaymentStatus("UNPAID");
        } else if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            order.setOrderStatus("COMPLETED");
            order.setPaymentStatus("REFUNDED");
            payment.setPaymentStatus("REFUNDED");
        }

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail d : details) {
            // trả hàng về kho
            adjustInventory(d.getProduct(), d.getQuantity(), order.getAccount());
        }

        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);
        paymentRepository.save(payment);

        return orderMapper.toResponse(order, details, payment);
    }

    @Override
    @Transactional
    public OrderResponse holdOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus("HOLD");
        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);

        return orderMapper.toResponse(
                order,
                orderDetailRepository.findByOrder(order),
                paymentRepository.findByOrder(order)
        );
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setOrderStatus("COMPLETED");
        order.setPaymentStatus("PAID");

        Payment payment = paymentRepository.findByOrder(order);
        if (payment != null) {
            payment.setPaymentStatus("PAID");
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);

        return orderMapper.toResponse(
                order,
                orderDetailRepository.findByOrder(order),
                payment
        );
    }


    private String generateOrderNumber() {
        long count = orderRepository.count() + 1;
        return String.format("ORD-%05d", count);
    }

    private void adjustInventory(Product product, int quantityChange, Account account) {
        Inventory inv = inventoryRepository.findByProduct(product)
                .orElseThrow(() -> new NoSuchElementException(
                        "Inventory not found for product: " + product.getProductName()));

        int newQty = inv.getQuantityInStock() + quantityChange;
        if (newQty < 0) {
            throw new AppException(ErrorCode.INVALID_STOCK_OPERATION);
        }

        inv.setQuantityInStock(newQty);
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
}
