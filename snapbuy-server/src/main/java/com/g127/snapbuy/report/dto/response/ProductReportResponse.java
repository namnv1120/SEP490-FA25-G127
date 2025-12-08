package com.g127.snapbuy.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReportResponse {
    private Long totalProductsSold; // Tổng số sản phẩm đã bán (tổng quantity)
    private Long uniqueProductsCount; // Số lượng sản phẩm khác nhau đã bán
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String period;
    private List<ProductSalesDetail> productDetails; // List sản phẩm với số lượng đã bán
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSalesDetail {
        private String productId;
        private String productName;
        private String productCode;
        private Long totalQuantitySold; // Tổng số lượng đã bán
        private String categoryName;
        private String supplierName;
        private BigDecimal unitPrice; // Giá bán
        private BigDecimal costPrice; // Giá nhập
    }
}

