package com.g127.snapbuy.report.service.impl;

import com.g127.snapbuy.inventory.dto.response.InventoryReportFullResponse;
import com.g127.snapbuy.inventory.dto.response.InventoryReportOverviewResponse;
import com.g127.snapbuy.inventory.dto.response.InventoryReportResponse;
import com.g127.snapbuy.inventory.entity.Inventory;
import com.g127.snapbuy.product.entity.Product;
import com.g127.snapbuy.product.entity.ProductPrice;
import com.g127.snapbuy.inventory.repository.InventoryRepository;

import com.g127.snapbuy.product.repository.ProductPriceRepository;
import com.g127.snapbuy.product.repository.ProductRepository;
import com.g127.snapbuy.report.service.InventoryReportService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryReportServiceImpl implements InventoryReportService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    private final ProductPriceRepository productPriceRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public InventoryReportFullResponse getInventoryReportByDate(LocalDate date) {
        log.info("Generating inventory report for date: {}", date);

        // Xác định thời điểm bắt đầu và kết thúc của ngày
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        // Nếu ngày được chọn là hôm nay và chưa hết ngày, lấy thời điểm hiện tại
        LocalDateTime reportTime = endOfDay;
        if (date.equals(LocalDate.now())) {
            reportTime = LocalDateTime.now();
        }

        // Lấy tất cả sản phẩm active
        List<Product> allProducts = productRepository.findAllActiveWithActiveCategory();
        
        List<InventoryReportResponse> details = new ArrayList<>();
        int totalProducts = 0;
        int currentTotalStock = 0;
        BigDecimal currentTotalValue = BigDecimal.ZERO;
        int productsWithDecrease = 0;

        for (Product product : allProducts) {
            try {
                InventoryReportResponse reportItem = generateReportForProduct(
                    product, 
                    startOfDay, 
                    reportTime
                );
                
                if (reportItem != null) {
                    details.add(reportItem);
                    totalProducts++;
                    currentTotalStock += (reportItem.getCurrentStock() != null ? reportItem.getCurrentStock() : 0);
                    currentTotalValue = currentTotalValue.add(
                        reportItem.getCurrentValue() != null ? reportItem.getCurrentValue() : BigDecimal.ZERO
                    );
                    
                    if (reportItem.getStockDifference() != null && reportItem.getStockDifference() < 0) {
                        productsWithDecrease++;
                    }
                }
            } catch (Exception e) {
                log.error("Error generating report for product {}: {}", product.getProductId(), e.getMessage());
            }
        }

        // Tạo overview
        InventoryReportOverviewResponse overview = InventoryReportOverviewResponse.builder()
            .totalProducts(totalProducts)
            .currentTotalStock(currentTotalStock)
            .currentTotalValue(currentTotalValue)
            .productsWithDecrease(productsWithDecrease)
            .build();

        return InventoryReportFullResponse.builder()
            .overview(overview)
            .details(details)
            .build();
    }

    private InventoryReportResponse generateReportForProduct(
        Product product, 
        LocalDateTime startOfDay, 
        LocalDateTime reportTime
    ) {
        UUID productId = product.getProductId();
        
        // BƯỚC 1: Kiểm tra xem sản phẩm đã tồn tại vào ngày được chọn chưa
        LocalDateTime firstTransactionDate = getFirstTransactionDate(productId);
        LocalDate selectedDate = startOfDay.toLocalDate();
        
        // Nếu ngày được chọn trước khi sản phẩm có giao dịch đầu tiên
        // hoặc trước khi sản phẩm được tạo → tồn kho = 0
        if (firstTransactionDate != null && reportTime.isBefore(firstTransactionDate)) {
            return InventoryReportResponse.builder()
                .productId(productId)
                .productCode(product.getProductCode())
                .productName(product.getProductName())
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : "N/A")
                .currentStock(0)
                .stockAtDate(0)
                .quantitySold(0)
                .quantityReceived(0)
                .stockDifference(0)
                .currentValue(BigDecimal.ZERO)
                .unitPrice(BigDecimal.ZERO)
                .build();
        }
        
        // BƯỚC 2: Lấy tồn kho hiện tại từ bảng inventory
        Integer currentStock = 0;
        Inventory inventory = inventoryRepository.findByProduct_ProductId(productId).orElse(null);
        if (inventory != null) {
            currentStock = inventory.getQuantityInStock() != null ? inventory.getQuantityInStock() : 0;
        }

        // BƯỚC 3: Tính số lượng đã bán trong ngày được chọn (từ orders)
        Integer quantitySold = getQuantitySoldInPeriod(productId, startOfDay, reportTime);

        // BƯỚC 4: Tính số lượng đã nhập trong ngày được chọn (từ inventory_transaction với type = 'IN')
        Integer quantityReceived = getQuantityReceivedInPeriod(productId, startOfDay, reportTime);

        // BƯỚC 5: Tính tồn tại thời điểm cuối ngày được chọn
        Integer stockAtDate;
        LocalDate today = LocalDate.now();
        
        if (selectedDate.equals(today)) {
            // Nếu là hôm nay, tồn tại thời điểm = tồn hiện tại
            stockAtDate = currentStock;
        } else {
            // Tính giao dịch từ sau ngày được chọn đến hiện tại
            LocalDateTime afterSelectedDate = reportTime.plusSeconds(1);
            LocalDateTime now = LocalDateTime.now();
            
            Integer soldAfterDate = getQuantitySoldInPeriod(productId, afterSelectedDate, now);
            Integer receivedAfterDate = getQuantityReceivedInPeriod(productId, afterSelectedDate, now);
            
            // Tồn tại thời điểm = tồn hiện tại + hàng đã bán sau đó - hàng đã nhập sau đó
            stockAtDate = currentStock + soldAfterDate - receivedAfterDate;
            
            // Đảm bảo không âm (trong trường hợp có lỗi dữ liệu)
            if (stockAtDate < 0) {
                stockAtDate = 0;
            }
        }

        // BƯỚC 6: Tính chênh lệch (âm = giảm, dương = tăng)
        Integer stockDifference = currentStock - stockAtDate;

        // BƯỚC 7: Lấy giá hiện tại của sản phẩm
        BigDecimal unitPrice = BigDecimal.ZERO;
        ProductPrice currentPrice = productPriceRepository.findCurrentPriceByProductId(productId).orElse(null);
        if (currentPrice != null && currentPrice.getUnitPrice() != null) {
            unitPrice = currentPrice.getUnitPrice();
        }

        // BƯỚC 8: Tính giá trị tồn kho hiện tại
        BigDecimal currentValue = unitPrice.multiply(BigDecimal.valueOf(currentStock));

        return InventoryReportResponse.builder()
            .productId(productId)
            .productCode(product.getProductCode())
            .productName(product.getProductName())
            .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : "N/A")
            .currentStock(currentStock)
            .stockAtDate(stockAtDate)
            .quantitySold(quantitySold)
            .quantityReceived(quantityReceived)
            .stockDifference(stockDifference)
            .currentValue(currentValue)
            .unitPrice(unitPrice)
            .build();
    }

    /**
     * Lấy số lượng sản phẩm đã bán trong khoảng thời gian
     */
    private Integer getQuantitySoldInPeriod(UUID productId, LocalDateTime startTime, LocalDateTime endTime) {
        String sql = """
            SELECT ISNULL(SUM(od.quantity), 0)
            FROM order_detail od
            INNER JOIN orders o ON od.order_id = o.order_id
            WHERE od.product_id = :productId
              AND o.payment_status = N'Đã thanh toán'
              AND o.created_date >= :startTime
              AND o.created_date <= :endTime
        """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("productId", productId);
        query.setParameter("startTime", startTime);
        query.setParameter("endTime", endTime);

        Object result = query.getSingleResult();
        if (result == null) {
            return 0;
        }
        
        return ((Number) result).intValue();
    }

    /**
     * Lấy số lượng sản phẩm đã nhập trong khoảng thời gian
     * Bao gồm cả:
     * 1. Inventory transactions với type = 'IN'
     * 2. Purchase orders đã nhận hàng (received_date trong khoảng thời gian)
     */
    private Integer getQuantityReceivedInPeriod(UUID productId, LocalDateTime startTime, LocalDateTime endTime) {
        String sql = """
            SELECT ISNULL(SUM(total_received), 0)
            FROM (
                -- Từ inventory_transaction
                SELECT SUM(it.quantity) as total_received
                FROM inventory_transaction it
                WHERE it.product_id = :productId
                  AND it.transaction_type = 'IN'
                  AND it.transaction_date >= :startTime
                  AND it.transaction_date <= :endTime
                
                UNION ALL
                
                -- Từ purchase_order
                SELECT SUM(pod.received_quantity) as total_received
                FROM purchase_order_detail pod
                INNER JOIN purchase_order po ON pod.purchase_order_id = po.purchase_order_id
                WHERE pod.product_id = :productId
                  AND po.received_date IS NOT NULL
                  AND po.received_date >= :startTime
                  AND po.received_date <= :endTime
                  AND pod.received_quantity IS NOT NULL
                  AND pod.received_quantity > 0
            ) combined
        """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("productId", productId);
        query.setParameter("startTime", startTime);
        query.setParameter("endTime", endTime);

        Object result = query.getSingleResult();
        if (result == null) {
            return 0;
        }
        
        return ((Number) result).intValue();
    }

    /**
     * Lấy thời điểm giao dịch đầu tiên của sản phẩm
     * Kiểm tra:
     * 1. inventory_transaction
     * 2. orders (đã thanh toán)
     * 3. purchase_order (đã nhận hàng)
     */
    private LocalDateTime getFirstTransactionDate(UUID productId) {
        String sql = """
            SELECT MIN(first_date) as earliest_date
            FROM (
                -- Từ inventory_transaction
                SELECT MIN(it.transaction_date) as first_date
                FROM inventory_transaction it
                WHERE it.product_id = :productId
                
                UNION ALL
                
                -- Từ orders
                SELECT MIN(o.created_date) as first_date
                FROM order_detail od
                INNER JOIN orders o ON od.order_id = o.order_id
                WHERE od.product_id = :productId
                  AND o.payment_status = N'Đã thanh toán'
                
                UNION ALL
                
                -- Từ purchase_order
                SELECT MIN(po.received_date) as first_date
                FROM purchase_order_detail pod
                INNER JOIN purchase_order po ON pod.purchase_order_id = po.purchase_order_id
                WHERE pod.product_id = :productId
                  AND po.received_date IS NOT NULL
            ) combined
        """;

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("productId", productId);

        Object result = query.getSingleResult();
        if (result == null) {
            return null;
        }
        
        // Convert result to LocalDateTime
        if (result instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) result).toLocalDateTime();
        }
        
        return null;
    }
}
