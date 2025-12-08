package com.g127.snapbuy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportResponse {
    private UUID productId;
    private String productCode;
    private String productName;
    private String categoryName;
    
    // Tồn hiện tại (lấy từ bảng inventory)
    private Integer currentStock;
    
    // Tồn tại thời điểm được chọn
    private Integer stockAtDate;
    
    // Số lượng đã bán trong ngày
    private Integer quantitySold;
    
    // Số lượng đã nhập trong ngày
    private Integer quantityReceived;
    
    // Chênh lệch = stockAtDate - currentStock
    private Integer stockDifference;
    
    // Giá trị tồn kho hiện tại
    private BigDecimal currentValue;
    
    // Giá hiện tại của sản phẩm
    private BigDecimal unitPrice;
}
