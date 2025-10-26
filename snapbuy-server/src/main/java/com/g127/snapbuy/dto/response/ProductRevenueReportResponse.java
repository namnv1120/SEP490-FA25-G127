package com.g127.snapbuy.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRevenueReportResponse {
    private UUID productId;
    private String productName;
    private int totalSold;
    private BigDecimal totalRevenue;
    private UUID categoryId;
    private String categoryName;
    private UUID supplierId;
    private String supplierName;
}
