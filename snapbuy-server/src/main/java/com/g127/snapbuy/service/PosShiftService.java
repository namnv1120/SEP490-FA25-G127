package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.PosShiftResponse;

import java.math.BigDecimal;

public interface PosShiftService {
    PosShiftResponse getCurrent(String username);
    PosShiftResponse open(String username, BigDecimal initialCash);
    PosShiftResponse close(String username, BigDecimal closingCash);
}

