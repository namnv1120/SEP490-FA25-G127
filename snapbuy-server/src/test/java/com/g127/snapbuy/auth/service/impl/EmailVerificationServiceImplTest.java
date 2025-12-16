package com.g127.snapbuy.auth.service.impl;

import com.g127.snapbuy.common.config.OtpStore;
import com.g127.snapbuy.auth.dto.request.VerifyEmailOtpRequest;
import com.g127.snapbuy.account.entity.Account;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.auth.service.MailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private MailService mailService;

    @Mock
    private OtpStore otpStore;

    @InjectMocks
    private EmailVerificationServiceImpl emailVerificationService;

    private Account testAccount;
    private UUID accountId;
    private String newEmail;
    private String currentEmail;

    @BeforeEach
    void setUp() {
        accountId = UUID.randomUUID();
        currentEmail = "current@example.com";
        newEmail = "new@example.com";

        testAccount = new Account();
        testAccount.setAccountId(accountId);
        testAccount.setUsername("testuser");
        testAccount.setEmail(currentEmail);
        testAccount.setFullName("Test User");
    }

    @Test
    void requestOtp_Success() {
        // Given
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByEmail(newEmail)).thenReturn(Optional.empty());
        when(otpStore.canResend(anyString(), anyInt())).thenReturn(true);

        // When
        emailVerificationService.requestOtp(accountId, newEmail);

        // Then
        verify(accountRepository).findById(accountId);
        verify(otpStore).put(anyString(), anyString(), any(OffsetDateTime.class));
        verify(otpStore).markResent(anyString());
        verify(mailService).sendHtml(eq(newEmail), anyString(), anyString());
    }

    @Test
    void requestOtp_AccountNotFound_ThrowsException() {
        // Given
        when(accountRepository.findById(accountId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, 
            () -> emailVerificationService.requestOtp(accountId, newEmail));
        verify(mailService, never()).sendHtml(anyString(), anyString(), anyString());
    }

    @Test
    void requestOtp_SameEmail_ThrowsException() {
        // Given
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> emailVerificationService.requestOtp(accountId, currentEmail));
        verify(mailService, never()).sendHtml(anyString(), anyString(), anyString());
    }

    @Test
    void requestOtp_EmailAlreadyUsed_ThrowsException() {
        // Given
        Account otherAccount = new Account();
        otherAccount.setAccountId(UUID.randomUUID());
        otherAccount.setEmail(newEmail);

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByEmail(newEmail)).thenReturn(Optional.of(otherAccount));

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> emailVerificationService.requestOtp(accountId, newEmail));
        verify(mailService, never()).sendHtml(anyString(), anyString(), anyString());
    }

    @Test
    void requestOtp_CannotResend_ThrowsException() {
        // Given
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByEmail(newEmail)).thenReturn(Optional.empty());
        when(otpStore.canResend(anyString(), anyInt())).thenReturn(false);

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> emailVerificationService.requestOtp(accountId, newEmail));
        verify(mailService, never()).sendHtml(anyString(), anyString(), anyString());
    }

    @Test
    void verifyOtp_Success() {
        // Given
        VerifyEmailOtpRequest request = new VerifyEmailOtpRequest();
        request.setNewEmail(newEmail);
        request.setCode("123456");

        OtpStore.OtpRecord otpRecord = new OtpStore.OtpRecord(
            "123456", 
            OffsetDateTime.now().plusMinutes(2), 
            OffsetDateTime.now()
        );

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(otpStore.get(anyString())).thenReturn(otpRecord);
        when(accountRepository.findByEmail(newEmail)).thenReturn(Optional.empty());
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // When
        emailVerificationService.verifyOtp(accountId, request);

        // Then
        verify(accountRepository).save(argThat(account -> 
            account.getEmail().equals(newEmail)
        ));
        verify(otpStore).remove(anyString());
    }

    @Test
    void verifyOtp_AccountNotFound_ThrowsException() {
        // Given
        VerifyEmailOtpRequest request = new VerifyEmailOtpRequest();
        request.setNewEmail(newEmail);
        request.setCode("123456");

        when(accountRepository.findById(accountId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, 
            () -> emailVerificationService.verifyOtp(accountId, request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void verifyOtp_InvalidOtp_ThrowsException() {
        // Given
        VerifyEmailOtpRequest request = new VerifyEmailOtpRequest();
        request.setNewEmail(newEmail);
        request.setCode("123456");

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(otpStore.get(anyString())).thenReturn(null);

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> emailVerificationService.verifyOtp(accountId, request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void verifyOtp_WrongCode_ThrowsException() {
        // Given
        VerifyEmailOtpRequest request = new VerifyEmailOtpRequest();
        request.setNewEmail(newEmail);
        request.setCode("999999");

        OtpStore.OtpRecord otpRecord = new OtpStore.OtpRecord(
            "123456", 
            OffsetDateTime.now().plusMinutes(2), 
            OffsetDateTime.now()
        );

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(otpStore.get(anyString())).thenReturn(otpRecord);

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> emailVerificationService.verifyOtp(accountId, request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void verifyOtp_EmailAlreadyUsedByOther_ThrowsException() {
        // Given
        VerifyEmailOtpRequest request = new VerifyEmailOtpRequest();
        request.setNewEmail(newEmail);
        request.setCode("123456");

        Account otherAccount = new Account();
        otherAccount.setAccountId(UUID.randomUUID());
        otherAccount.setEmail(newEmail);

        OtpStore.OtpRecord otpRecord = new OtpStore.OtpRecord(
            "123456", 
            OffsetDateTime.now().plusMinutes(2), 
            OffsetDateTime.now()
        );

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(otpStore.get(anyString())).thenReturn(otpRecord);
        when(accountRepository.findByEmail(newEmail)).thenReturn(Optional.of(otherAccount));

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> emailVerificationService.verifyOtp(accountId, request));
        verify(accountRepository, never()).save(any(Account.class));
    }
}
