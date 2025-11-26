package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.CashDenominationRequest;
import com.g127.snapbuy.dto.response.PosShiftResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface PosShiftService {
    PosShiftResponse getCurrent(String username);
    PosShiftResponse open(String username, BigDecimal initialCash, List<CashDenominationRequest> cashDenominations);
    PosShiftResponse openForEmployee(String ownerUsername, UUID employeeAccountId, BigDecimal initialCash, List<CashDenominationRequest> cashDenominations);
    PosShiftResponse close(String username, BigDecimal closingCash, String note, List<CashDenominationRequest> cashDenominations);
    List<PosShiftResponse> getMyShifts(String username, String status);
    List<PosShiftResponse> getShiftsByAccount(UUID accountId, String status);
    List<PosShiftResponse> getAllActiveShifts(String ownerUsername);
}
