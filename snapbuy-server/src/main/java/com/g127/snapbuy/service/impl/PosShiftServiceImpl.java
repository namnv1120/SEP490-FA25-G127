package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.response.PosShiftResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.PosShift;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.PosShiftRepository;
import com.g127.snapbuy.service.PosShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PosShiftServiceImpl implements PosShiftService {

    private final AccountRepository accountRepository;
    private final PosShiftRepository posShiftRepository;

    private UUID resolveAccountId(String usernameOrEmail) {
        return accountRepository.findByUsername(usernameOrEmail)
                .map(Account::getAccountId)
                .or(() -> accountRepository.findByEmail(usernameOrEmail).map(Account::getAccountId))
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + usernameOrEmail));
    }

    private PosShiftResponse toResponse(PosShift s) {
        return PosShiftResponse.builder()
                .shiftId(s.getShiftId() != null ? s.getShiftId().toString() : null)
                .accountId(s.getAccount() != null && s.getAccount().getAccountId() != null ? s.getAccount().getAccountId().toString() : null)
                .initialCash(s.getInitialCash())
                .closingCash(s.getClosingCash())
                .openedAt(s.getOpenedAt())
                .closedAt(s.getClosedAt())
                .status(s.getStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PosShiftResponse getCurrent(String username) {
        UUID accountId = resolveAccountId(username);
        return posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở")
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional
    public PosShiftResponse open(String username, BigDecimal initialCash) {
        UUID accountId = resolveAccountId(username);
        posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở")
                .ifPresent(s -> { throw new IllegalStateException("Ca đang mở"); });

        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        PosShift s = PosShift.builder()
                .account(acc)
                .initialCash(initialCash == null ? BigDecimal.ZERO : initialCash)
                .status("Mở")
                .openedAt(LocalDateTime.now())
                .build();
        return toResponse(posShiftRepository.save(s));
    }

    @Override
    @Transactional
    public PosShiftResponse close(String username, BigDecimal closingCash) {
        UUID accountId = resolveAccountId(username);
        PosShift s = posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở")
                .orElseThrow(() -> new IllegalStateException("Không có ca đang mở"));
        s.setClosingCash(closingCash == null ? BigDecimal.ZERO : closingCash);
        s.setClosedAt(LocalDateTime.now());
        s.setStatus("Đóng");
        return toResponse(posShiftRepository.save(s));
    }
}
