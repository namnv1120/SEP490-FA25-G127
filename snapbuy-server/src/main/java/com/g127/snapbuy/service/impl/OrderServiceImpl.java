package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.OrderCreateRequest;
import com.g127.snapbuy.dto.request.OrderDetailRequest;
import com.g127.snapbuy.dto.response.OrderResponse;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.mapper.OrderMapper;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.MoMoService;
import com.g127.snapbuy.service.PromotionService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private final PromotionService promotionService;
    private final PosSettingsRepository posSettingsRepository;

    private UUID resolveCurrentAccountId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Không xác định được tài khoản đăng nhập");
        }
        String username = auth.getName();
        return accountRepository.findByUsername(username)
                .map(Account::getAccountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + username));
    }

    private Customer getGuestCustomer() {
        UUID guestId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        return customerRepository.findById(guestId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy khách lẻ mặc định"));
    }

    private Customer resolveCustomerStrict(String phone) {
        if (phone == null || phone.isBlank()) {
            return getGuestCustomer();
        }
        Customer found = customerRepository.getCustomerByPhone(phone.trim());
        if (found == null) {
            throw new NoSuchElementException("Không tìm thấy khách với số điện thoại: " + phone.trim());
        }
        return found;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty())
            throw new IllegalArgumentException("Đơn hàng phải có ít nhất 1 sản phẩm");

        UUID currentAccountId = resolveCurrentAccountId();
        Account creator = accountRepository.findById(currentAccountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        Customer customer = resolveCustomerStrict(req.getPhone());
        boolean isGuest = customer.getCustomerId().toString()
                .equals("00000000-0000-0000-0000-000000000001");

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
            BigDecimal promoPercent = promotionService.computeBestDiscountPercent(product.getProductId(), unitPrice, LocalDateTime.now());
            if (promoPercent != null && promoPercent.compareTo(discountPercent) > 0) {
                discountPercent = promoPercent;
            }
            if (discountPercent.compareTo(BigDecimal.ZERO) < 0 || discountPercent.compareTo(BigDecimal.valueOf(100)) > 0)
                throw new IllegalArgumentException("Giảm giá phải trong khoảng 0–100%");

            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                    discountPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));

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

            subtractInventoryOnly(product, item.getQuantity());
        }

        BigDecimal billDiscountPercent = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal billDiscountAmount = total.multiply(
                billDiscountPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        BigDecimal afterDiscount = total.subtract(billDiscountAmount);

        BigDecimal taxPercent = req.getTaxAmount() != null ? req.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal taxAmount = afterDiscount.multiply(
                taxPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));

        BigDecimal grandTotal = afterDiscount.add(taxAmount);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) grandTotal = BigDecimal.ZERO;

        int pointsRedeemed = 0;
        int pointsEarned = 0;

        if (!isGuest) {
            int currentPoints = customer.getPoints() == null ? 0 : customer.getPoints();
            int requestedUse = Optional.ofNullable(req.getUsePoints()).orElse(0);

            int capByMoney = grandTotal.setScale(0, RoundingMode.FLOOR).intValue();
            pointsRedeemed = Math.min(Math.max(0, requestedUse), Math.min(currentPoints, capByMoney));
        }

        BigDecimal payable = grandTotal.subtract(BigDecimal.valueOf(pointsRedeemed));
        if (payable.signum() < 0) payable = BigDecimal.ZERO;

        if (!isGuest) {
            // Lấy % điểm tích lũy từ POS settings
            BigDecimal loyaltyPointsPercent = BigDecimal.ZERO; // Mặc định 0%
            PosSettings posSettings = posSettingsRepository.findByAccount(creator).orElse(null);
            if (posSettings != null && posSettings.getLoyaltyPointsPercent() != null) {
                loyaltyPointsPercent = posSettings.getLoyaltyPointsPercent();
            }

            // Tính điểm tích lũy: payable × loyaltyPointsPercent / 100
            pointsEarned = payable.multiply(loyaltyPointsPercent)
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR)
                    .intValue();

            if (pointsRedeemed > 0) {
                int currentPoints = customer.getPoints() == null ? 0 : customer.getPoints();
                int newPoints = Math.max(0, currentPoints - pointsRedeemed);
                customer.setPoints(newPoints);
                customerRepository.save(customer);
            }
        }
        
        order.setPointsRedeemed(pointsRedeemed);
        order.setPointsEarned(pointsEarned);
        order.setDiscountAmount(billDiscountAmount);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(payable);
        orderRepository.save(order);
        orderDetailRepository.saveAll(orderDetails);

        Payment payment = new Payment();
        payment.setOrder(order);
        String method = Optional.ofNullable(req.getPaymentMethod()).orElse("Tiền mặt");
        payment.setPaymentMethod(method);
        payment.setAmount(payable);
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
                } else {
                    log.warn("Phản hồi MoMo rỗng hoặc thiếu payUrl cho đơn {}", orderNumber);
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        orderRepository.save(order);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (var i : req.getItems()) {
            BigDecimal up = i.getUnitPrice();
            if (up == null || up.compareTo(BigDecimal.ZERO) <= 0) {
                ProductPrice price = productPriceRepository.findCurrentPriceByProductId(i.getProductId())
                        .orElseThrow(() -> new NoSuchElementException("Không tìm thấy giá đang hiệu lực"));
                up = price.getUnitPrice();
            }
            subtotal = subtotal.add(up.multiply(BigDecimal.valueOf(i.getQuantity())));
        }

        OrderResponse resp = orderMapper.toResponse(order, orderDetails, payment);
        resp.setSubtotal(subtotal);
        resp.setPointsRedeemed(pointsRedeemed);
        resp.setPointsEarned(pointsEarned);
        return resp;
    }

    @Override
    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        Payment payment = paymentRepository.findByOrder(order);

        OrderResponse resp = orderMapper.toResponse(order, details, payment);
        BigDecimal subtotal = details.stream()
                .map(d -> d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setSubtotal(subtotal);
        resp.setPointsRedeemed(order.getPointsRedeemed());
        resp.setPointsEarned(order.getPointsEarned());
        return resp;
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(order -> {
                    List<OrderDetail> details = orderDetailRepository.findByOrder(order);
                    Payment payment = paymentRepository.findByOrder(order);
                    OrderResponse resp = orderMapper.toResponse(order, details, payment);
                    BigDecimal subtotal = details.stream()
                            .map(d -> d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    resp.setSubtotal(subtotal);
                    resp.setPointsRedeemed(order.getPointsRedeemed());
                    resp.setPointsEarned(order.getPointsEarned());
                    return resp;
                })
                .toList();
    }

    @Override
    public List<OrderResponse> searchOrders(String searchTerm, String orderStatus, LocalDateTime fromDate, LocalDateTime toDate) {
        // Normalize searchTerm - null hoặc empty string
        String normalizedSearchTerm = (searchTerm == null || searchTerm.trim().isEmpty()) ? null : searchTerm.trim();
        String normalizedOrderStatus = (orderStatus == null || orderStatus.trim().isEmpty()) ? null : orderStatus.trim();
        
        // Set time for date range
        LocalDateTime normalizedFromDate = null;
        LocalDateTime normalizedToDate = null;
        
        if (fromDate != null) {
            normalizedFromDate = fromDate.withHour(0).withMinute(0).withSecond(0).withNano(0);
        }
        if (toDate != null) {
            normalizedToDate = toDate.withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        }
        
        List<Order> orders = orderRepository.searchOrders(
                normalizedSearchTerm,
                normalizedOrderStatus,
                normalizedFromDate,
                normalizedToDate
        );
        
        return orders.stream()
                .map(order -> {
                    List<OrderDetail> details = orderDetailRepository.findByOrder(order);
                    Payment payment = paymentRepository.findByOrder(order);
                    OrderResponse resp = orderMapper.toResponse(order, details, payment);
                    BigDecimal subtotal = details.stream()
                            .map(d -> d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    resp.setSubtotal(subtotal);
                    resp.setPointsRedeemed(order.getPointsRedeemed());
                    resp.setPointsEarned(order.getPointsEarned());
                    return resp;
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

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);

        if ("Chưa thanh toán".equalsIgnoreCase(order.getPaymentStatus())) {
            for (OrderDetail d : details) {
                addInventoryBack(d.getProduct(), d.getQuantity(), order.getAccount(),
                        "Hủy đơn " + order.getOrderNumber());
            }
            
            Customer c = order.getCustomer();
            boolean isGuest = c == null || c.getCustomerId().toString()
                    .equals("00000000-0000-0000-0000-000000000001");
            if (!isGuest) {
                int cur = c.getPoints() == null ? 0 : c.getPoints();
                
                int pointsRedeemed = order.getPointsRedeemed() == null ? 0 : order.getPointsRedeemed();
                
                if (pointsRedeemed > 0) {
                    long next = (long) cur + pointsRedeemed;
                    c.setPoints((int) next);
                    customerRepository.save(c);
                }
            }
            
            order.setOrderStatus("Đã hủy");
            order.setPaymentStatus("Thất bại");
            payment.setPaymentStatus("Thất bại");

        } else if ("Đã thanh toán".equalsIgnoreCase(order.getPaymentStatus())) {
            for (OrderDetail d : details) {
                addInventoryBack(d.getProduct(), d.getQuantity(), order.getAccount(),
                        "Trả hàng từ đơn " + order.getOrderNumber());
            }

            Customer c = order.getCustomer();
            boolean isGuest = c == null || c.getCustomerId().toString()
                    .equals("00000000-0000-0000-0000-000000000001");
            if (!isGuest) {
                int cur = c.getPoints() == null ? 0 : c.getPoints();

                int pointsRedeemed = order.getPointsRedeemed() == null ? 0 : order.getPointsRedeemed();

                // Sử dụng pointsEarned đã lưu trong order thay vì tính lại
                int earned = order.getPointsEarned() == null ? 0 : order.getPointsEarned();
                long next = (long) cur - Math.max(0, earned) + pointsRedeemed;
                if (next < 0) next = 0;
                c.setPoints((int) next);
                customerRepository.save(c);
            }

            order.setOrderStatus("Đã hủy");
            order.setPaymentStatus("Đã hoàn tiền");
            payment.setPaymentStatus("Đã hoàn tiền");
        }

        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);
        paymentRepository.save(payment);

        OrderResponse resp = orderMapper.toResponse(order, details, payment);
        BigDecimal subtotal = details.stream()
                .map(d -> d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setSubtotal(subtotal);
        return resp;
    }

    @Override
    @Transactional
    public OrderResponse holdOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        order.setOrderStatus("Chờ xử lý");
        order.setUpdatedDate(LocalDateTime.now());
        orderRepository.save(order);

        OrderResponse resp = orderMapper.toResponse(
                order,
                orderDetailRepository.findByOrder(order),
                paymentRepository.findByOrder(order)
        );
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        BigDecimal subtotal = details.stream()
                .map(d -> d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setSubtotal(subtotal);
        resp.setPointsRedeemed(order.getPointsRedeemed());
        resp.setPointsEarned(order.getPointsEarned());
        return resp;
    }

    @Override
    @Transactional
    public OrderResponse completeOrder(UUID id) {
        finalizePayment(id);

        Order order = orderRepository.findById(id).orElseThrow();
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        Payment payment = paymentRepository.findByOrder(order);
        OrderResponse resp = orderMapper.toResponse(order, details, payment);
        BigDecimal subtotal = details.stream()
                .map(d -> d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setSubtotal(subtotal);
        resp.setPointsRedeemed(order.getPointsRedeemed());
        resp.setPointsEarned(order.getPointsEarned());
        return resp;
    }

    @Override
    @Transactional
    public void finalizePaymentByReference(String transactionReference) {
        Payment payment = paymentRepository.findByTransactionReference(transactionReference)
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy thanh toán với reference: " + transactionReference));

        finalizePayment(payment.getOrder().getOrderId());
    }

    @Override
    @Transactional
    public void cancelOrderByReference(String transactionReference) {
        Payment payment = paymentRepository.findByTransactionReference(transactionReference)
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy thanh toán với reference: " + transactionReference));

        Order order = payment.getOrder();
        List<OrderDetail> details = orderDetailRepository.findByOrder(order);

        for (OrderDetail d : details) {
            addInventoryBack(d.getProduct(), d.getQuantity(), order.getAccount(),
                    "Hủy đơn " + order.getOrderNumber() + " do thanh toán MoMo thất bại");
        }

        order.setOrderStatus("Đã hủy");
        order.setPaymentStatus("Thất bại");
        order.setUpdatedDate(LocalDateTime.now());
        payment.setPaymentStatus("Thất bại");

        orderRepository.save(order);
        paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public void finalizePayment(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy đơn hàng"));

        if ("Đã thanh toán".equalsIgnoreCase(order.getPaymentStatus())) {
            return;
        }

        Payment payment = paymentRepository.findByOrder(order);
        if (payment == null) {
            throw new NoSuchElementException("Không tìm thấy thanh toán cho đơn hàng");
        }

        Customer customer = order.getCustomer();
        boolean isGuest = customer == null || customer.getCustomerId().toString()
                .equals("00000000-0000-0000-0000-000000000001");
        
        if (!isGuest) {
            int pointsRedeemed = order.getPointsRedeemed() == null ? 0 : order.getPointsRedeemed();
            int pointsEarned = order.getPointsEarned() == null ? 0 : order.getPointsEarned();

            // Nếu chưa có pointsEarned, tính lại theo settings
            if (pointsEarned == 0 && order.getTotalAmount() != null) {
                BigDecimal loyaltyPointsPercent = BigDecimal.ZERO; // Mặc định 0%
                Account account = order.getAccount();
                if (account != null) {
                    PosSettings posSettings = posSettingsRepository.findByAccount(account).orElse(null);
                    if (posSettings != null && posSettings.getLoyaltyPointsPercent() != null) {
                        loyaltyPointsPercent = posSettings.getLoyaltyPointsPercent();
                    }
                }
                pointsEarned = order.getTotalAmount().multiply(loyaltyPointsPercent)
                        .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR)
                        .intValue();
                order.setPointsEarned(pointsEarned);
            }

            int currentPoints = customer.getPoints() == null ? 0 : customer.getPoints();
            long newPoints = (long) currentPoints - pointsRedeemed + pointsEarned;
            if (newPoints < 0) newPoints = 0;
            customer.setPoints((int) newPoints);
            customerRepository.save(customer);
        }

        order.setOrderStatus("Hoàn tất");
        order.setPaymentStatus("Đã thanh toán");
        order.setUpdatedDate(LocalDateTime.now());

        payment.setPaymentStatus("Đã thanh toán");
        payment.setPaymentDate(LocalDateTime.now());

        List<OrderDetail> details = orderDetailRepository.findByOrder(order);
        String customerCode = order.getCustomer() != null
                ? order.getCustomer().getCustomerCode()
                : "Khách vãng lai";

        for (OrderDetail d : details) {
            recordSaleTransaction(
                    d.getProduct(),
                    d.getQuantity(),
                    d.getUnitPrice(),
                    order.getAccount(),
                    order.getOrderNumber(),
                    customerCode
            );
        }

        orderRepository.save(order);
        paymentRepository.save(payment);
    }

    private synchronized String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));

        long countToday = orderRepository.countByCreatedDateBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().atTime(23, 59, 59)
        );
        long nextNumber = countToday + 1;
        return "ORD" + datePart + String.format("%03d", nextNumber);
    }

    public Long getMyTodayOrderCount(String paymentStatus) {
        UUID accountId = resolveCurrentAccountId();
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(23, 59, 59);
        return orderRepository.countOrdersByAccountAndDateRange(accountId, start, end, paymentStatus);
    }

    public BigDecimal getMyTodayRevenue(String paymentStatus) {
        UUID accountId = resolveCurrentAccountId();
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(23, 59, 59);
        return orderRepository.sumRevenueByAccountAndDateRange(accountId, start, end, paymentStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<OrderResponse> getMyOrdersByDateTimeRange(LocalDateTime from, LocalDateTime to) {
        UUID accountId = resolveCurrentAccountId();
        List<Order> orders = orderRepository.findByAccountAndOrderDateBetween(accountId, from, to);
        if (orders == null || orders.isEmpty()) {
            orders = orderRepository.findByAccountAndCreatedDateBetween(accountId, from, to);
        }
        return orders.stream().map(order -> {
            List<OrderDetail> details = orderDetailRepository.findByOrder(order);
            Payment payment = paymentRepository.findByOrder(order);
            return orderMapper.toResponse(order, details, payment);
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<OrderResponse> getOrdersByAccountAndDateTimeRange(UUID accountId, LocalDateTime from, LocalDateTime to) {
        List<Order> orders = orderRepository.findByAccountAndOrderDateBetween(accountId, from, to);
        if (orders == null || orders.isEmpty()) {
            orders = orderRepository.findByAccountAndCreatedDateBetween(accountId, from, to);
        }
        return orders.stream().map(order -> {
            List<OrderDetail> details = orderDetailRepository.findByOrder(order);
            Payment payment = paymentRepository.findByOrder(order);
            return orderMapper.toResponse(order, details, payment);
        }).toList();
    }


    private void subtractInventoryOnly(Product product, int quantity) {
        Inventory inv = inventoryRepository.findByProduct(product)
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy tồn kho cho sản phẩm: " + product.getProductName()));
        int newQty = inv.getQuantityInStock() - quantity;
        if (newQty < 0) throw new IllegalArgumentException("Không đủ tồn kho");

        inv.setQuantityInStock(newQty);
        inv.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inv);
    }

    private void recordSaleTransaction(
            Product product,
            int quantity,
            BigDecimal unitPrice,
            Account account,
            String orderNumber,
            String customerCode
    ) {
        InventoryTransaction trx = new InventoryTransaction();
        trx.setProduct(product);
        trx.setAccount(account);
        trx.setTransactionType("Bán ra");
        trx.setQuantity(quantity);
        trx.setUnitPrice(unitPrice);
        trx.setReferenceType("Đơn hàng");
        trx.setReferenceId(null);
        trx.setNotes("Bán cho khách " + customerCode + " - Đơn " + orderNumber);
        trx.setTransactionDate(LocalDateTime.now());
        inventoryTransactionRepository.save(trx);
    }

    private void addInventoryBack(Product product, int quantity, Account account, String notes) {
        Inventory inv = inventoryRepository.findByProduct(product)
                .orElseThrow(() -> new NoSuchElementException(
                        "Không tìm thấy tồn kho cho sản phẩm: " + product.getProductName()));

        inv.setQuantityInStock(inv.getQuantityInStock() + quantity);
        inv.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inv);

        InventoryTransaction trx = new InventoryTransaction();
        trx.setProduct(product);
        trx.setAccount(account);
        trx.setTransactionType("Trả hàng");
        trx.setQuantity(quantity);
        trx.setReferenceType("Đơn hàng");
        trx.setReferenceId(null);
        trx.setNotes(notes);
        trx.setTransactionDate(LocalDateTime.now());
        inventoryTransactionRepository.save(trx);
    }

}
