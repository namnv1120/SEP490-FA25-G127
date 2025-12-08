package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.config.OtpStore;
import com.g127.snapbuy.dto.request.ForgotPasswordRequest;
import com.g127.snapbuy.dto.request.ResetPasswordRequest;
import com.g127.snapbuy.dto.request.VerifyOtpRequest;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.service.MailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ForgotPasswordServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MailService mailService;

    @Mock
    private OtpStore otpStore;

    @InjectMocks
    private ForgotPasswordServiceImpl forgotPasswordService;

    private Account testAccount;
    private String testEmail;

    @BeforeEach
    void setUp() {
        testEmail = "test@example.com";
        
        testAccount = new Account();
        testAccount.setAccountId(UUID.randomUUID());
        testAccount.setUsername("testuser");
        testAccount.setEmail(testEmail);
        testAccount.setPasswordHash("oldHashedPassword");
    }

    @Test
    void requestOtp_Success() {
        // Given
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(testEmail);

        when(accountRepository.findByEmail(testEmail)).thenReturn(Optional.of(testAccount));
        when(otpStore.canResend(anyString(), anyInt())).thenReturn(true);

        // When
        forgotPasswordService.requestOtp(request);

        // Then
        verify(accountRepository).findByEmail(testEmail);
        verify(otpStore).put(eq(testEmail), anyString(), any(OffsetDateTime.class));
        verify(otpStore).markResent(testEmail);
        verify(mailService).sendHtml(eq(testEmail), anyString(), anyString());
    }

    @Test
    void requestOtp_EmailNotFound_ThrowsException() {
        // Given
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("nonexistent@example.com");

        when(accountRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, 
            () -> forgotPasswordService.requestOtp(request));
        verify(mailService, never()).sendHtml(anyString(), anyString(), anyString());
    }

    @Test
    void requestOtp_CannotResend_ThrowsException() {
        // Given
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(testEmail);

        when(accountRepository.findByEmail(testEmail)).thenReturn(Optional.of(testAccount));
        when(otpStore.canResend(anyString(), anyInt())).thenReturn(false);

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> forgotPasswordService.requestOtp(request));
        verify(mailService, never()).sendHtml(anyString(), anyString(), anyString());
    }

    @Test
    void verifyOtp_Success() {
        // Given
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail(testEmail);
        request.setCode("123456");

        OtpStore.OtpRecord otpRecord = new OtpStore.OtpRecord(
            "123456", 
            OffsetDateTime.now().plusMinutes(2), 
            OffsetDateTime.now()
        );

        when(otpStore.get(testEmail)).thenReturn(otpRecord);

        // When
        forgotPasswordService.verifyOtp(request);

        // Then
        verify(otpStore).get(testEmail);
        assertEquals(1, otpRecord.attempts);
    }

    @Test
    void verifyOtp_InvalidOtp_ThrowsException() {
        // Given
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail(testEmail);
        request.setCode("123456");

        when(otpStore.get(testEmail)).thenReturn(null);

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> forgotPasswordService.verifyOtp(request));
    }

    @Test
    void verifyOtp_WrongCode_ThrowsException() {
        // Given
        VerifyOtpRequest request = new VerifyOtpRequest();
        request.setEmail(testEmail);
        request.setCode("999999");

        OtpStore.OtpRecord otpRecord = new OtpStore.OtpRecord(
            "123456", 
            OffsetDateTime.now().plusMinutes(2), 
            OffsetDateTime.now()
        );

        when(otpStore.get(testEmail)).thenReturn(otpRecord);

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> forgotPasswordService.verifyOtp(request));
        assertEquals(1, otpRecord.attempts);
    }

    @Test
    void resetPassword_Success() {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(testEmail);
        request.setCode("123456");
        request.setNewPassword("newPassword123");
        request.setConfirmNewPassword("newPassword123");

        OtpStore.OtpRecord otpRecord = new OtpStore.OtpRecord(
            "123456", 
            OffsetDateTime.now().plusMinutes(2), 
            OffsetDateTime.now()
        );

        when(otpStore.get(testEmail)).thenReturn(otpRecord);
        when(accountRepository.findByEmail(testEmail)).thenReturn(Optional.of(testAccount));
        when(passwordEncoder.encode(anyString())).thenReturn("newHashedPassword");
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // When
        forgotPasswordService.resetPassword(request);

        // Then
        verify(passwordEncoder).encode("newPassword123");
        verify(accountRepository).save(argThat(account -> 
            account.getPasswordHash().equals("newHashedPassword")
        ));
        verify(otpStore).remove(testEmail);
    }

    @Test
    void resetPassword_PasswordMismatch_ThrowsException() {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(testEmail);
        request.setCode("123456");
        request.setNewPassword("newPassword123");
        request.setConfirmNewPassword("differentPassword");

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> forgotPasswordService.resetPassword(request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void resetPassword_InvalidOtp_ThrowsException() {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(testEmail);
        request.setCode("123456");
        request.setNewPassword("newPassword123");
        request.setConfirmNewPassword("newPassword123");

        when(otpStore.get(testEmail)).thenReturn(null);

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> forgotPasswordService.resetPassword(request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void resetPassword_WrongCode_ThrowsException() {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(testEmail);
        request.setCode("999999");
        request.setNewPassword("newPassword123");
        request.setConfirmNewPassword("newPassword123");

        OtpStore.OtpRecord otpRecord = new OtpStore.OtpRecord(
            "123456", 
            OffsetDateTime.now().plusMinutes(2), 
            OffsetDateTime.now()
        );

        when(otpStore.get(testEmail)).thenReturn(otpRecord);

        // When & Then
        assertThrows(IllegalStateException.class, 
            () -> forgotPasswordService.resetPassword(request));
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    void resetPassword_EmailNotFound_ThrowsException() {
        // Given
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail(testEmail);
        request.setCode("123456");
        request.setNewPassword("newPassword123");
        request.setConfirmNewPassword("newPassword123");

        OtpStore.OtpRecord otpRecord = new OtpStore.OtpRecord(
            "123456", 
            OffsetDateTime.now().plusMinutes(2), 
            OffsetDateTime.now()
        );

        when(otpStore.get(testEmail)).thenReturn(otpRecord);
        when(accountRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, 
            () -> forgotPasswordService.resetPassword(request));
        verify(accountRepository, never()).save(any(Account.class));
    }
}
