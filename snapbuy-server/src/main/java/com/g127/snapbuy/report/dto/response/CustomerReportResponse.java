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
public class CustomerReportResponse {
    private Long customerCount; // Tổng số khách hàng
    private Long totalProductsPurchased; // Tổng số sản phẩm khách hàng đã mua (số lượng sản phẩm khác nhau)
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String period;
    private List<CustomerPurchaseDetail> customerDetails; // List khách hàng với số sản phẩm đã mua
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerPurchaseDetail {
        private String customerId;
        private String customerCode;
        private String customerName;
        private String phone;
        private Long productsPurchasedCount; // Số lượng sản phẩm khác nhau đã mua
        private Long totalQuantityPurchased; // Tổng số lượng sản phẩm đã mua
    }
}

