package com.g127.snapbuy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PosShiftResponse {
    private String shiftId;
    private String accountId;
    private BigDecimal initialCash;
    private BigDecimal closingCash;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private String status;
    private String note;
}
