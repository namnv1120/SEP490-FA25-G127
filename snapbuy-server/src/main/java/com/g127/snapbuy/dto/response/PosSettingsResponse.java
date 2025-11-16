package com.g127.snapbuy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosSettingsResponse {
    private UUID settingsId;
    private BigDecimal taxPercent;
    private BigDecimal discountPercent;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

