package com.g127.snapbuy.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductPriceResponse {
    private UUID priceId;

    private UUID productId;
    private String productCode;
    private String productName;

    private BigDecimal unitPrice;
    private BigDecimal costPrice;

    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private LocalDateTime createdDate;
}
