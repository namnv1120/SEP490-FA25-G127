package com.g127.snapbuy.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    private UUID purchaseOrderId;
    private String purchaseOrderNumber;
    private UUID supplierId;
    private UUID accountId;
    private String status;
    private Double totalAmount;
    private Double taxAmount;
    private String notes;
    private LocalDateTime orderDate;
    private LocalDateTime receivedDate;
    private List<PurchaseOrderDetailResponse> details;
    private String supplierCode;
    private String supplierName;
    private String fullName;
    private String username;
    private LocalDateTime emailSentAt;
}
