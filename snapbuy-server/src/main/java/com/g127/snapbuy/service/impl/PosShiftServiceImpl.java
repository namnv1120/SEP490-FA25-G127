package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.CashDenominationRequest;
import com.g127.snapbuy.dto.response.CashDenominationResponse;
import com.g127.snapbuy.dto.response.PosShiftResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.PosShift;
import com.g127.snapbuy.entity.ShiftCashDenomination;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.PosShiftRepository;
import com.g127.snapbuy.repository.ShiftCashDenominationRepository;
import com.g127.snapbuy.service.PosShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosShiftServiceImpl implements PosShiftService {

    private final AccountRepository accountRepository;
    private final PosShiftRepository posShiftRepository;
    private final ShiftCashDenominationRepository cashDenominationRepository;

    private UUID resolveAccountId(String usernameOrEmail) {
        return accountRepository.findByUsername(usernameOrEmail)
                .map(Account::getAccountId)
                .or(() -> accountRepository.findByEmail(usernameOrEmail).map(Account::getAccountId))
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + usernameOrEmail));
    }

    private PosShiftResponse toResponse(PosShift s) {
        List<CashDenominationResponse> closingDenominations = new ArrayList<>();
        List<CashDenominationResponse> openingDenominations = new ArrayList<>();

        if (s.getCashDenominations() != null && !s.getCashDenominations().isEmpty()) {
            // Phân loại mệnh giá theo type: OPENING (mở ca) hoặc CLOSING (đóng ca)
            closingDenominations = s.getCashDenominations().stream()
                    .filter(d -> ShiftCashDenomination.TYPE_CLOSING.equals(d.getDenominationType()))
                    .map(d -> CashDenominationResponse.builder()
                            .id(d.getId() != null ? d.getId().toString() : null)
                            .denomination(d.getDenomination())
                            .quantity(d.getQuantity())
                            .totalValue(d.getTotalValue())
                            .build())
                    .collect(Collectors.toList());

            openingDenominations = s.getCashDenominations().stream()
                    .filter(d -> ShiftCashDenomination.TYPE_OPENING.equals(d.getDenominationType()))
                    .map(d -> CashDenominationResponse.builder()
                            .id(d.getId() != null ? d.getId().toString() : null)
                            .denomination(d.getDenomination())
                            .quantity(d.getQuantity())
                            .totalValue(d.getTotalValue())
                            .build())
                    .collect(Collectors.toList());
        }

        return PosShiftResponse.builder()
                .shiftId(s.getShiftId() != null ? s.getShiftId().toString() : null)
                .accountId(s.getAccount() != null && s.getAccount().getAccountId() != null ? s.getAccount().getAccountId().toString() : null)
                .accountName(s.getAccount() != null ? s.getAccount().getFullName() : null)
                .openedByAccountId(s.getOpenedBy() != null && s.getOpenedBy().getAccountId() != null ? s.getOpenedBy().getAccountId().toString() : null)
                .openedByAccountName(s.getOpenedBy() != null ? s.getOpenedBy().getFullName() : null)
                .initialCash(s.getInitialCash())
                .closingCash(s.getClosingCash())
                .openedAt(s.getOpenedAt())
                .closedAt(s.getClosedAt())
                .status(s.getStatus())
                .note(s.getClosingNote())
                .cashDenominations(closingDenominations)
                .initialCashDenominations(openingDenominations)
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
    public PosShiftResponse open(String username, BigDecimal initialCash, List<CashDenominationRequest> cashDenominations) {
        UUID accountId = resolveAccountId(username);
        posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở")
                .ifPresent(s -> { throw new IllegalStateException("Ca đang mở"); });

        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        PosShift s = PosShift.builder()
                .account(acc)
                .openedBy(acc)
                .initialCash(initialCash == null ? BigDecimal.ZERO : initialCash)
                .status("Mở")
                .openedAt(LocalDateTime.now())
                .build();

        PosShift savedShift = posShiftRepository.save(s);

        // Lưu chi tiết mệnh giá tiền khi mở ca
        saveOpeningCashDenominations(savedShift, cashDenominations);

        return toResponse(savedShift);
    }

    @Override
    @Transactional
    public PosShiftResponse openForEmployee(String ownerUsername, UUID employeeAccountId, BigDecimal initialCash, List<CashDenominationRequest> cashDenominations) {
        // Kiểm tra owner
        UUID ownerId = resolveAccountId(ownerUsername);
        Account owner = accountRepository.findById(ownerId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản chủ cửa hàng"));

        // Kiểm tra nhân viên có ca đang mở không
        posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(employeeAccountId, "Mở")
                .ifPresent(s -> { throw new IllegalStateException("Nhân viên đang có ca mở"); });

        // Lấy thông tin nhân viên
        Account employee = accountRepository.findById(employeeAccountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy nhân viên"));

        // Tạo ca mới cho nhân viên
        PosShift s = PosShift.builder()
                .account(employee)
                .openedBy(owner)
                .initialCash(initialCash == null ? BigDecimal.ZERO : initialCash)
                .status("Mở")
                .openedAt(LocalDateTime.now())
                .build();

        PosShift savedShift = posShiftRepository.save(s);

        // Lưu chi tiết mệnh giá tiền khi mở ca
        saveOpeningCashDenominations(savedShift, cashDenominations);

        return toResponse(savedShift);
    }

    /**
     * Lưu chi tiết mệnh giá tiền khi mở ca
     */
    private void saveOpeningCashDenominations(PosShift shift, List<CashDenominationRequest> cashDenominations) {
        if (cashDenominations != null && !cashDenominations.isEmpty()) {
            List<ShiftCashDenomination> denominations = cashDenominations.stream()
                    .filter(d -> d.getQuantity() != null && d.getQuantity() > 0)
                    .map(d -> {
                        BigDecimal totalValue = BigDecimal.valueOf(d.getDenomination())
                                .multiply(BigDecimal.valueOf(d.getQuantity()));
                        return ShiftCashDenomination.builder()
                                .shift(shift)
                                .denomination(d.getDenomination())
                                .quantity(d.getQuantity())
                                .totalValue(totalValue)
                                .denominationType(ShiftCashDenomination.TYPE_OPENING)
                                .build();
                    })
                    .collect(Collectors.toList());

            shift.getCashDenominations().addAll(denominations);
            posShiftRepository.save(shift);
        }
    }

    @Override
    @Transactional
    public PosShiftResponse close(String username, BigDecimal closingCash, String note, List<CashDenominationRequest> cashDenominations) {
        UUID accountId = resolveAccountId(username);
        PosShift s = posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở")
                .orElseThrow(() -> new IllegalStateException("Không có ca đang mở"));

        s.setClosingCash(closingCash == null ? BigDecimal.ZERO : closingCash);
        s.setClosedAt(LocalDateTime.now());
        s.setStatus("Đóng");
        s.setClosingNote(note);

        // Lưu chi tiết mệnh giá tiền khi đóng ca
        if (cashDenominations != null && !cashDenominations.isEmpty()) {
            // Xóa các mệnh giá CLOSING cũ (nếu có), giữ lại OPENING
            s.getCashDenominations().removeIf(d -> ShiftCashDenomination.TYPE_CLOSING.equals(d.getDenominationType()));

            List<ShiftCashDenomination> closingDenominations = cashDenominations.stream()
                    .filter(d -> d.getQuantity() != null && d.getQuantity() > 0)
                    .map(d -> {
                        BigDecimal totalValue = BigDecimal.valueOf(d.getDenomination())
                                .multiply(BigDecimal.valueOf(d.getQuantity()));
                        return ShiftCashDenomination.builder()
                                .shift(s)
                                .denomination(d.getDenomination())
                                .quantity(d.getQuantity())
                                .totalValue(totalValue)
                                .denominationType(ShiftCashDenomination.TYPE_CLOSING)
                                .build();
                    })
                    .collect(Collectors.toList());

            s.getCashDenominations().addAll(closingDenominations);
        }

        return toResponse(posShiftRepository.save(s));
    }

    @Override
    @Transactional
    public PosShiftResponse closeForEmployee(String ownerUsername, UUID employeeAccountId, BigDecimal closingCash, String note, List<CashDenominationRequest> cashDenominations) {
        // Kiểm tra owner có quyền không (đã được kiểm tra ở controller qua @PreAuthorize)
        
        // Tìm ca đang mở của nhân viên
        PosShift s = posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(employeeAccountId, "Mở")
                .orElseThrow(() -> new IllegalStateException("Nhân viên không có ca đang mở"));

        s.setClosingCash(closingCash == null ? BigDecimal.ZERO : closingCash);
        s.setClosedAt(LocalDateTime.now());
        s.setStatus("Đóng");
        s.setClosingNote(note != null ? note : "Đóng ca bởi chủ cửa hàng");

        // Lưu chi tiết mệnh giá tiền khi đóng ca
        if (cashDenominations != null && !cashDenominations.isEmpty()) {
            // Xóa các mệnh giá CLOSING cũ (nếu có), giữ lại OPENING
            s.getCashDenominations().removeIf(d -> ShiftCashDenomination.TYPE_CLOSING.equals(d.getDenominationType()));

            List<ShiftCashDenomination> closingDenominations = cashDenominations.stream()
                    .filter(d -> d.getQuantity() != null && d.getQuantity() > 0)
                    .map(d -> {
                        BigDecimal totalValue = BigDecimal.valueOf(d.getDenomination())
                                .multiply(BigDecimal.valueOf(d.getQuantity()));
                        return ShiftCashDenomination.builder()
                                .shift(s)
                                .denomination(d.getDenomination())
                                .quantity(d.getQuantity())
                                .totalValue(totalValue)
                                .denominationType(ShiftCashDenomination.TYPE_CLOSING)
                                .build();
                    })
                    .collect(Collectors.toList());

            s.getCashDenominations().addAll(closingDenominations);
        }

        return toResponse(posShiftRepository.save(s));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PosShiftResponse> getMyShifts(String username, String status) {
        UUID accountId = resolveAccountId(username);
        List<PosShift> shifts = (status == null || status.isBlank())
                ? posShiftRepository.findByAccount_AccountIdOrderByOpenedAtDesc(accountId)
                : posShiftRepository.findByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, status);
        return shifts.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PosShiftResponse> getShiftsByAccount(UUID accountId, String status) {
        List<PosShift> shifts = (status == null || status.isBlank())
                ? posShiftRepository.findByAccount_AccountIdOrderByOpenedAtDesc(accountId)
                : posShiftRepository.findByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, status);
        return shifts.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PosShiftResponse> getAllActiveShifts(String ownerUsername) {
        List<PosShift> shifts = posShiftRepository.findByStatusOrderByOpenedAtDesc("Mở");
        return shifts.stream().map(this::toResponse).toList();
    }
}
