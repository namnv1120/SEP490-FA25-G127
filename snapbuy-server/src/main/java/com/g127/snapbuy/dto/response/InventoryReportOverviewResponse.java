package com.g127.snapbuy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportOverviewResponse {
    // Tổng số sản phẩm
    private Integer totalProducts;
    
    // Tổng số lượng tồn hiện tại
    private Integer currentTotalStock;
    
    // Tổng giá trị tồn kho hiện tại
    private BigDecimal currentTotalValue;
    
    // Số sản phẩm có tồn kho giảm (stockDifference < 0)
    private Integer productsWithDecrease;
}
