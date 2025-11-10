package com.g127.snapbuy.dto.response;

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
public class SupplierReportResponse {
    private Long supplierCount; // Tổng số nhà cung cấp
    private BigDecimal totalAmount; // Tổng tiền đã nhập
    private Long uniqueProductsCount; // Số lượng sản phẩm khác nhau đã nhập
    private Long totalQuantityReceived; // Tổng số lượng sản phẩm đã nhập
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String period;
    private List<SupplierProductDetail> supplierDetails; // List nhà cung cấp với số sản phẩm
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierProductDetail {
        private String supplierId;
        private String supplierCode;
        private String supplierName;
        private String phone;
        private Long productsReceivedCount; // Số lượng sản phẩm khác nhau đã nhập
        private Long totalQuantityReceived; // Tổng số lượng sản phẩm đã nhập
        private BigDecimal totalAmount; // Tổng tiền đã nhập từ nhà cung cấp này
    }
}

