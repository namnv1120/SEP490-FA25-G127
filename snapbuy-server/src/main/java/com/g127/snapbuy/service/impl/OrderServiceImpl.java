package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.*;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.mapper.OrderMapper;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.MoMoService;
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
    private final MoMoService moMoService;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest req) {
        if (req.getAccountId() == null)
            throw new IllegalArgumentException("Thiếu accountId");
        if (req.getItems() == null || req.getItems().isEmpty())
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất 1 sản phẩm");

        Account creator = accountRepository.findById(req.getAccountId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        Customer customer;
        if (req.getCustomerId() == null) {
            UUID defaultCustomerId = UUID.fromString("00000000-0000-0000-0000-000000000001");
            customer = customerRepository.findById(defaultCustomerId)
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy khách vãng lai mặc định"));
        } else {
            customer = customerRepository.findById(req.getCustomerId())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy khách hàng"));
        }

        String orderNumber = generateOrderNumber();
        Order order = new Order();
        order.setOrderNumber(orderNumber);
        order.setAccount(creator);
        order.setCustomer(customer);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderStatus("Chờ xác nhận");
        order.setPaymentStatus("Chưa thanh toán");
        order.setNotes(req.getNotes());
        order.setCreatedDate(LocalDateTime.now());
        order.setUpdatedDate(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (OrderDetailRequest item : req.getItems()) {
            if (item.getProductId() == null)
                throw new IllegalArgumentException("Thiếu productId cho mặt hàng");
            if (item.getQuantity() == null || item.getQuantity() <= 0)
                throw new IllegalArgumentException("Số lượng phải > 0");

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new NoSuchElementException("Không tìm thấy sản phẩm"));

            Inventory inv = inventoryRepository.findByProduct(product)
                    .orElseThrow(() -> new NoSuchElementException(
                            "Không tìm thấy tồn kho cho sản phẩm: " + product.getProductName()));

            if (inv.getQuantityInStock() < item.getQuantity())
                throw new IllegalArgumentException("Không đủ tồn kho cho sản phẩm: " + product.getProductName());

            BigDecimal unitPrice = item.getUnitPrice();
            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                ProductPrice price = productPriceRepository.findCurrentPriceByProductId(product.getProductId())
                        .orElseThrow(() -> new NoSuchElementException(
                                "Không tìm thấy giá đang hiệu lực cho sản phẩm: " + product.getProductName()));
                unitPrice = price.getUnitPrice();
            }

            BigDecimal discountPercent = item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO;
            if (discountPercent.compareTo(BigDecimal.ZERO) < 0 || discountPercent.compareTo(BigDecimal.valueOf(100)) > 0)
                throw new IllegalArgumentException("Giảm giá phải trong khoảng 0–100%");

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
                billDiscountPercent.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP));
        BigDecimal afterDiscount = total.subtract(billDiscountAmount);

        BigDecimal taxPercent = req.getTaxAmount() != null ? req.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal taxAmount = afterDiscount.multiply(
                taxPercent.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP));

        BigDecimal grandTotal = afterDiscount.add(taxAmount);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) grandTotal = BigDecimal.ZERO;

        order.setDiscountAmount(billDiscountAmount);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(grandTotal);
        orderRepository.save(order);
        orderDetailRepository.saveAll(orderDetails);

        Payment payment = new Payment();
        payment.setOrder(order);
        String method = Optional.ofNullable(req.getPaymentMethod()).orElse("CASH");
        payment.setPaymentMethod(method);
        payment.setAmount(grandTotal);
        payment.setPaymentStatus("Chưa thanh toán");
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        if ("MOMO".equalsIgnoreCase(method) || "Ví điện tử".equalsIgnoreCase(method)) {
            try {
                var momoResp = moMoService.createPayment(order.getOrderId());
                if (momoResp != null && momoResp.getPayUrl() != null) {
                    payment.setTransactionReference(momoResp.getRequestId());
                    payment.setNotes("PAYURL:" + momoResp.getPayUrl());
                    paymentRepository.save(payment);
                    log.info("Tạo MoMo QR cho đơn {} - {}", orderNumber, momoResp.getPayUrl());
                } else {
                    log.warn("Phản hồi MoMo rỗng hoặc thiếu payUrl cho đơn {}", orderNumber);
                }
            } catch (Exception e) {
                log.error("Tạo thanh toán MoMo thất bại cho đơn {}: {}", orderNumber, e.getMessage(), e);
            }
        }

        orderRepository.save(order);
        return orderMapper.toResponse(order, orderDetails, payment);
    }

    @Override
    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
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
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));

        Payment payment = paymentRepository.findByOrder(order);
        if (payment == null) throw new NoSuchElementException("Không tìm thấy thanh toán của đơn hàng");

        if ("Chưa thanh toán".equalsIgnoreCase(order.getPaymentStatus())) {
            order.setOrderStatus("Đã hủy");
            order.setPaymentStatus("Chưa thanh toán");
            payment.setPaymentStatus("Chưa thanh toán");
        } else if ("Đã thanh toán".equalsIgnoreCase(order.getPaymentStatus())) {
            order.setOrderStatus("Hoàn tất");
            order.setPaymentStatus("Đã hoàn tiền");
            payment.setPaymentStatus("Đã hoàn tiền");
        }

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        for (OrderDetail d : details) {
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setOrderStatus("Chờ xử lý");
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setOrderStatus("Hoàn tất");
        order.setPaymentStatus("Đã thanh toán");

        Payment payment = paymentRepository.findByOrder(order);
        if (payment != null) {
            payment.setPaymentStatus("Đã thanh toán");
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
                        "Không tìm thấy tồn kho cho sản phẩm: " + product.getProductName()));

        int newQty = inv.getQuantityInStock() + quantityChange;
        if (newQty < 0) throw new IllegalArgumentException("Không đủ tồn kho");

        inv.setQuantityInStock(newQty);
        inv.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inv);

        InventoryTransaction trx = new InventoryTransaction();
        trx.setTransactionId(UUID.randomUUID());
        trx.setProduct(product);
        trx.setAccount(account);
        trx.setTransactionType(quantityChange < 0 ? "Bán ra" : "Hủy bán");
        trx.setQuantity(Math.abs(quantityChange));
        trx.setTransactionDate(LocalDateTime.now());
        inventoryTransactionRepository.save(trx);
    }
}
