package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.OrderCreateRequest;
import com.g127.snapbuy.dto.request.OrderDetailRequest;
import com.g127.snapbuy.dto.response.OrderResponse;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.mapper.OrderMapper;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.MoMoService;
import com.g127.snapbuy.service.PromotionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final PromotionService promotionService;

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
            // Tự động áp dụng khuyến mãi tốt nhất cho sản phẩm này
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

        // Tính toán điểm: Trừ điểm đã sử dụng ngay khi tạo đơn, cộng điểm tích lũy khi thanh toán
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
            pointsEarned = payable.divide(BigDecimal.valueOf(500), 0, RoundingMode.FLOOR).intValue();
            
            // Trừ điểm đã sử dụng ngay khi tạo đơn
            if (pointsRedeemed > 0) {
                int currentPoints = customer.getPoints() == null ? 0 : customer.getPoints();
                int newPoints = Math.max(0, currentPoints - pointsRedeemed);
                customer.setPoints(newPoints);
                customerRepository.save(customer);
                log.info("Tạo đơn {}: Đã trừ {} điểm từ tài khoản khách hàng (điểm còn lại: {})",
                        orderNumber, pointsRedeemed, newPoints);
            }
            // KHÔNG cộng điểm tích lũy ở đây - sẽ cộng khi thanh toán thành công
        }
        
        // Lưu pointsRedeemed và pointsEarned vào order (giờ đã có field trong entity)
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
                    log.info("Tạo MoMo QR cho đơn {} - {}", orderNumber, momoResp.getPayUrl());
                } else {
                    log.warn("Phản hồi MoMo rỗng hoặc thiếu payUrl cho đơn {}", orderNumber);
                }
            } catch (Exception e) {
                log.error("Tạo thanh toán MoMo thất bại cho đơn {}: {}", orderNumber, e.getMessage(), e);
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
            
            // Trả lại điểm đã sử dụng vì điểm đã bị trừ khi tạo đơn
            Customer c = order.getCustomer();
            boolean isGuest = c == null || c.getCustomerId().toString()
                    .equals("00000000-0000-0000-0000-000000000001");
            if (!isGuest) {
                int cur = c.getPoints() == null ? 0 : c.getPoints();
                
                // Lấy điểm đã sử dụng (pointsRedeemed) từ order
                int pointsRedeemed = order.getPointsRedeemed() == null ? 0 : order.getPointsRedeemed();
                
                // Trả lại điểm đã sử dụng
                if (pointsRedeemed > 0) {
                    long next = (long) cur + pointsRedeemed;
                    c.setPoints((int) next);
                    customerRepository.save(c);
                    log.info("Hủy đơn {} (chưa thanh toán): Đã trả lại {} điểm cho khách hàng",
                            order.getOrderNumber(), pointsRedeemed);
                }
            }
            
            order.setOrderStatus("Đã hủy");
            order.setPaymentStatus("Chưa thanh toán");
            payment.setPaymentStatus("Chưa thanh toán");

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
                
                // Lấy điểm đã sử dụng (pointsRedeemed) từ order
                int pointsRedeemed = order.getPointsRedeemed() == null ? 0 : order.getPointsRedeemed();
                
                // Trừ điểm đã tích lũy (earned) và trả lại điểm đã sử dụng (redeemed)
                int earned = order.getTotalAmount() == null ? 0
                        : order.getTotalAmount().divide(BigDecimal.valueOf(500), 0, RoundingMode.FLOOR).intValue();
                long next = (long) cur - Math.max(0, earned) + pointsRedeemed; // Trả lại điểm đã sử dụng
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
            log.info("Đơn {} đã được thanh toán trước đó, bỏ qua", order.getOrderNumber());
            return;
        }

        Payment payment = paymentRepository.findByOrder(order);
        if (payment == null) {
            throw new NoSuchElementException("Không tìm thấy thanh toán cho đơn hàng");
        }

        // Xử lý điểm khi thanh toán thành công
        Customer customer = order.getCustomer();
        boolean isGuest = customer == null || customer.getCustomerId().toString()
                .equals("00000000-0000-0000-0000-000000000001");
        
        if (!isGuest) {
            // Lấy điểm đã sử dụng và điểm sẽ tích lũy từ order
            int pointsRedeemed = order.getPointsRedeemed() == null ? 0 : order.getPointsRedeemed();
            int pointsEarned = order.getPointsEarned() == null ? 0 : order.getPointsEarned();
            
            // Nếu pointsEarned chưa được tính (null hoặc 0), tính lại từ totalAmount
            if (pointsEarned == 0 && order.getTotalAmount() != null) {
                pointsEarned = order.getTotalAmount().divide(BigDecimal.valueOf(500), 0, RoundingMode.FLOOR).intValue();
                // Lưu lại vào order để dùng sau này
                order.setPointsEarned(pointsEarned);
            }
            
            // Trừ điểm đã sử dụng và cộng điểm tích lũy
            int currentPoints = customer.getPoints() == null ? 0 : customer.getPoints();
            long newPoints = (long) currentPoints - pointsRedeemed + pointsEarned;
            if (newPoints < 0) newPoints = 0;
            customer.setPoints((int) newPoints);
            customerRepository.save(customer);
            
            log.info("Đã cập nhật điểm cho khách hàng {}: trừ {} điểm, cộng {} điểm, điểm mới: {}",
                    customer.getCustomerCode(), pointsRedeemed, pointsEarned, newPoints);
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

        log.info("Hoàn tất thanh toán cho đơn {}, đã ghi {} lịch sử tồn kho",
                order.getOrderNumber(), details.size());
    }

    private String generateOrderNumber() {
        long count = orderRepository.count() + 1;
        return String.format("ORD-%05d", count);
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
