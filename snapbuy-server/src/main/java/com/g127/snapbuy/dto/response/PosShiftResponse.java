package com.g127.snapbuy.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PosShiftResponse {
    private String shiftId;
    private String accountId;
    private String accountName;
    private String openedByAccountId;
    private String openedByAccountName;
    private BigDecimal initialCash;
    private BigDecimal closingCash;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private String status;
    private String note;
    private List<CashDenominationResponse> cashDenominations; // Mệnh giá khi đóng ca
    private List<CashDenominationResponse> initialCashDenominations; // Mệnh giá khi mở ca
}
