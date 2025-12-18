package com.g127.snapbuy.order.service.impl;

import com.g127.snapbuy.account.entity.Account;
import com.g127.snapbuy.shift.entity.PosShift;
import com.g127.snapbuy.order.dto.request.CashDenominationRequest;
import com.g127.snapbuy.order.dto.response.PosShiftResponse;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.shift.repository.PosShiftRepository;
import com.g127.snapbuy.shift.repository.ShiftCashDenominationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PosShiftServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PosShiftRepository posShiftRepository;

    @Mock
    private ShiftCashDenominationRepository cashDenominationRepository;

    @InjectMocks
    private PosShiftServiceImpl posShiftService;

    private Account testAccount;
    private Account ownerAccount;
    private PosShift testShift;
    private UUID accountId;
    private UUID ownerId;
    private UUID shiftId;

    @BeforeEach
    void setUp() {
        accountId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        shiftId = UUID.randomUUID();

        testAccount = new Account();
        testAccount.setAccountId(accountId);
        testAccount.setUsername("testuser");
        testAccount.setFullName("Test User");

        ownerAccount = new Account();
        ownerAccount.setAccountId(ownerId);
        ownerAccount.setUsername("owner");
        ownerAccount.setFullName("Shop Owner");

        testShift = new PosShift();
        testShift.setShiftId(shiftId);
        testShift.setAccount(testAccount);
        testShift.setOpenedBy(testAccount);
        testShift.setInitialCash(BigDecimal.valueOf(1000000));
        testShift.setStatus("Mở");
        testShift.setOpenedAt(LocalDateTime.now());
        testShift.setCashDenominations(new ArrayList<>());
    }

    @Test
    void getCurrent_WithOpenShift_Success() {
        // Given
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở"))
                .thenReturn(Optional.of(testShift));

        // When
        PosShiftResponse result = posShiftService.getCurrent("testuser");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getShiftId()).isEqualTo(shiftId.toString());
        assertThat(result.getStatus()).isEqualTo("Mở");
        verify(posShiftRepository).findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở");
    }

    @Test
    void getCurrent_NoOpenShift_ReturnsNull() {
        // Given
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở"))
                .thenReturn(Optional.empty());

        // When
        PosShiftResponse result = posShiftService.getCurrent("testuser");

        // Then
        assertThat(result).isNull();
    }

    @Test
    void open_WithValidData_Success() {
        // Given
        BigDecimal initialCash = BigDecimal.valueOf(1000000);
        CashDenominationRequest denomination = new CashDenominationRequest();
        denomination.setDenomination(500000);
        denomination.setQuantity(2);
        List<CashDenominationRequest> denominations = Arrays.asList(denomination);

        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở"))
                .thenReturn(Optional.empty());
        when(posShiftRepository.save(any(PosShift.class))).thenAnswer(i -> {
            PosShift shift = i.getArgument(0);
            shift.setShiftId(shiftId);
            return shift;
        });

        // When
        PosShiftResponse result = posShiftService.open("testuser", initialCash, denominations);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getInitialCash()).isEqualTo(initialCash);
        assertThat(result.getStatus()).isEqualTo("Mở");
        verify(posShiftRepository, times(2)).save(any(PosShift.class)); // Called twice: initial save + save after adding denominations
    }

    @Test
    void open_WithExistingOpenShift_ThrowsException() {
        // Given
        BigDecimal initialCash = BigDecimal.valueOf(1000000);
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở"))
                .thenReturn(Optional.of(testShift));

        // When & Then
        assertThatThrownBy(() -> posShiftService.open("testuser", initialCash, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Ca đang mở");
    }

    @Test
    void open_WithNegativeInitialCash_ThrowsException() {
        // Given
        BigDecimal negativeInitialCash = BigDecimal.valueOf(-1000);

        // When & Then
        assertThatThrownBy(() -> posShiftService.open("testuser", negativeInitialCash, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Số tiền ban đầu không được âm");
    }

    @Test
    void openForEmployee_Success() {
        // Given
        UUID employeeId = UUID.randomUUID();
        Account employee = new Account();
        employee.setAccountId(employeeId);
        employee.setUsername("employee");
        employee.setFullName("Employee Name");

        BigDecimal initialCash = BigDecimal.valueOf(500000);
        List<CashDenominationRequest> denominations = new ArrayList<>();

        when(accountRepository.findByUsername("owner")).thenReturn(Optional.of(ownerAccount));
        when(accountRepository.findById(ownerId)).thenReturn(Optional.of(ownerAccount));
        when(accountRepository.findById(employeeId)).thenReturn(Optional.of(employee));
        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(employeeId, "Mở"))
                .thenReturn(Optional.empty());
        when(posShiftRepository.save(any(PosShift.class))).thenAnswer(i -> {
            PosShift shift = i.getArgument(0);
            shift.setShiftId(UUID.randomUUID());
            return shift;
        });

        // When
        PosShiftResponse result = posShiftService.openForEmployee("owner", employeeId, initialCash, denominations);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getInitialCash()).isEqualTo(initialCash);
        assertThat(result.getStatus()).isEqualTo("Mở");
        verify(posShiftRepository).save(any(PosShift.class));
    }

    @Test
    void openForEmployee_WithExistingOpenShift_ThrowsException() {
        // Given
        UUID employeeId = UUID.randomUUID();
        Account employee = new Account();
        employee.setAccountId(employeeId);
        
        PosShift existingShift = new PosShift();
        existingShift.setStatus("Mở");

        when(accountRepository.findByUsername("owner")).thenReturn(Optional.of(ownerAccount));
        when(accountRepository.findById(ownerId)).thenReturn(Optional.of(ownerAccount));  // Needed for owner verification
        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(employeeId, "Mở"))
                .thenReturn(Optional.of(existingShift));

        // When & Then
        assertThatThrownBy(() -> posShiftService.openForEmployee("owner", employeeId, BigDecimal.ZERO, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Nhân viên đang có ca mở");
    }

    @Test
    void close_Success() {
        // Given
        BigDecimal closingCash = BigDecimal.valueOf(1200000);
        String note = "Ca làm tốt";
        List<CashDenominationRequest> denominations = new ArrayList<>();

        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở"))
                .thenReturn(Optional.of(testShift));
        when(posShiftRepository.save(any(PosShift.class))).thenAnswer(i -> i.getArgument(0));

        // When
        PosShiftResponse result = posShiftService.close("testuser", closingCash, note, denominations);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getClosingCash()).isEqualTo(closingCash);
        assertThat(result.getStatus()).isEqualTo("Đóng");
        assertThat(result.getNote()).isEqualTo(note);
        verify(posShiftRepository).save(testShift);
    }

    @Test
    void close_WithNoOpenShift_ThrowsException() {
        // Given
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở"))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> posShiftService.close("testuser", BigDecimal.ZERO, null, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Không có ca đang mở");
    }

    @Test
    void close_WithNegativeClosingCash_ThrowsException() {
        // Given
        BigDecimal negativeClosingCash = BigDecimal.valueOf(-1000);

        // When & Then
        assertThatThrownBy(() -> posShiftService.close("testuser", negativeClosingCash, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Số tiền cuối ca không được âm");
    }

    @Test
    void closeForEmployee_Success() {
        // Given
        UUID employeeId = UUID.randomUUID();
        Account employee = new Account();
        employee.setAccountId(employeeId);
        employee.setFullName("Employee Name");

        PosShift employeeShift = new PosShift();
        employeeShift.setShiftId(UUID.randomUUID());
        employeeShift.setAccount(employee);
        employeeShift.setOpenedBy(ownerAccount);
        employeeShift.setStatus("Mở");
        employeeShift.setCashDenominations(new ArrayList<>());

        BigDecimal closingCash = BigDecimal.valueOf(800000);
        String note = "Đóng ca nhân viên";

        when(posShiftRepository.findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(employeeId, "Mở"))
                .thenReturn(Optional.of(employeeShift));
        when(posShiftRepository.save(any(PosShift.class))).thenAnswer(i -> i.getArgument(0));

        // When
        PosShiftResponse result = posShiftService.closeForEmployee("owner", employeeId, closingCash, note, null);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getClosingCash()).isEqualTo(closingCash);
        assertThat(result.getStatus()).isEqualTo("Đóng");
        verify(posShiftRepository).save(employeeShift);
    }

    @Test
    void getMyShifts_WithStatus_Success() {
        // Given
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(posShiftRepository.findByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Đóng"))
                .thenReturn(Arrays.asList(testShift));

        // When
        List<PosShiftResponse> result = posShiftService.getMyShifts("testuser", "Đóng");

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(posShiftRepository).findByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Đóng");
    }

    @Test
    void getMyShifts_WithoutStatus_Success() {
        // Given
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(posShiftRepository.findByAccount_AccountIdOrderByOpenedAtDesc(accountId))
                .thenReturn(Arrays.asList(testShift));

        // When
        List<PosShiftResponse> result = posShiftService.getMyShifts("testuser", null);

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(posShiftRepository).findByAccount_AccountIdOrderByOpenedAtDesc(accountId);
    }

    @Test
    void getShiftsByAccount_WithStatus_Success() {
        // Given
        when(posShiftRepository.findByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở"))
                .thenReturn(Arrays.asList(testShift));

        // When
        List<PosShiftResponse> result = posShiftService.getShiftsByAccount(accountId, "Mở");

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(posShiftRepository).findByAccount_AccountIdAndStatusOrderByOpenedAtDesc(accountId, "Mở");
    }

    @Test
    void getShiftsByAccount_WithoutStatus_Success() {
        // Given
        when(posShiftRepository.findByAccount_AccountIdOrderByOpenedAtDesc(accountId))
                .thenReturn(Arrays.asList(testShift));

        // When
        List<PosShiftResponse> result = posShiftService.getShiftsByAccount(accountId, null);

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(posShiftRepository).findByAccount_AccountIdOrderByOpenedAtDesc(accountId);
    }

    @Test
    void getAllActiveShifts_Success() {
        // Given
        PosShift shift1 = new PosShift();
        shift1.setShiftId(UUID.randomUUID());
        shift1.setStatus("Mở");
        shift1.setAccount(testAccount);
        shift1.setOpenedBy(testAccount);
        shift1.setCashDenominations(new ArrayList<>());

        PosShift shift2 = new PosShift();
        shift2.setShiftId(UUID.randomUUID());
        shift2.setStatus("Mở");
        shift2.setAccount(ownerAccount);
        shift2.setOpenedBy(ownerAccount);
        shift2.setCashDenominations(new ArrayList<>());

        when(posShiftRepository.findByStatusOrderByOpenedAtDesc("Mở"))
                .thenReturn(Arrays.asList(shift1, shift2));

        // When
        List<PosShiftResponse> result = posShiftService.getAllActiveShifts("owner");

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(2);
        verify(posShiftRepository).findByStatusOrderByOpenedAtDesc("Mở");
    }
}
