package com.g127.snapbuy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransactionResponse {
    private UUID transactionId;
    private UUID productId;
    private String productName;
    private UUID accountId;
    private String accountName;
    private String transactionType;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String referenceType;
    private UUID referenceId;
    private String notes;
    private LocalDateTime transactionDate;
}


