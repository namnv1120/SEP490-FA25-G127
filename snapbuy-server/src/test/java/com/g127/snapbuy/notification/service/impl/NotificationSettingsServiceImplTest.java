package com.g127.snapbuy.notification.service.impl;

import com.g127.snapbuy.notification.dto.request.NotificationSettingsUpdateRequest;
import com.g127.snapbuy.notification.dto.response.NotificationSettingsResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.NotificationSettings;
import com.g127.snapbuy.mapper.NotificationSettingsMapper;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.NotificationSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationSettingsServiceImplTest {

    @Mock
    private NotificationSettingsRepository notificationSettingsRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private NotificationSettingsMapper mapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private NotificationSettingsServiceImpl notificationSettingsService;

    private Account testAccount;
    private NotificationSettings testSettings;
    private NotificationSettingsResponse settingsResponse;
    private UUID accountId;

    @BeforeEach
    void setUp() {
        accountId = UUID.randomUUID();

        testAccount = new Account();
        testAccount.setAccountId(accountId);
        testAccount.setUsername("testuser");

        testSettings = NotificationSettings.builder()
                .settingsId(UUID.randomUUID())
                .accountId(accountId)
                .lowStockEnabled(true)
                .promotionEnabled(true)
                .purchaseOrderEnabled(true)
                .build();

        settingsResponse = NotificationSettingsResponse.builder()
                .settingsId(testSettings.getSettingsId())
                .accountId(accountId)
                .lowStockEnabled(true)
                .promotionEnabled(true)
                .purchaseOrderEnabled(true)
                .build();

        setupSecurityContext();
    }

    private void setupSecurityContext() {
        lenient().when(authentication.getName()).thenReturn("testuser");
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        lenient().when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
    }

    @Test
    void getSettings_ExistingSettings_Success() {
        // Given
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.of(testSettings));
        when(mapper.toResponse(testSettings)).thenReturn(settingsResponse);

        // When
        NotificationSettingsResponse result = notificationSettingsService.getSettings();

        // Then
        assertNotNull(result);
        assertEquals(accountId, result.getAccountId());
        assertTrue(result.getLowStockEnabled());
        assertTrue(result.getPromotionEnabled());
        assertTrue(result.getPurchaseOrderEnabled());
    }

    @Test
    void getSettings_NoExistingSettings_CreatesDefault() {
        // Given
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.empty())
            .thenReturn(Optional.empty());
        when(notificationSettingsRepository.save(any(NotificationSettings.class)))
            .thenReturn(testSettings);
        when(mapper.toResponse(any(NotificationSettings.class))).thenReturn(settingsResponse);

        // When
        NotificationSettingsResponse result = notificationSettingsService.getSettings();

        // Then
        assertNotNull(result);
        verify(notificationSettingsRepository).save(any(NotificationSettings.class));
    }

    @Test
    void updateSettings_Success() {
        // Given
        NotificationSettingsUpdateRequest request = new NotificationSettingsUpdateRequest();
        request.setLowStockEnabled(false);
        request.setPromotionEnabled(true);
        request.setPurchaseOrderEnabled(false);

        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.of(testSettings));
        when(notificationSettingsRepository.save(any(NotificationSettings.class)))
            .thenReturn(testSettings);
        when(mapper.toResponse(any(NotificationSettings.class))).thenReturn(settingsResponse);

        // When
        NotificationSettingsResponse result = notificationSettingsService.updateSettings(request);

        // Then
        assertNotNull(result);
        verify(mapper).updateEntity(testSettings, request);
        verify(notificationSettingsRepository).save(testSettings);
    }

    @Test
    void updateSettings_NoExistingSettings_CreatesNew() {
        // Given
        NotificationSettingsUpdateRequest request = new NotificationSettingsUpdateRequest();
        request.setLowStockEnabled(false);

        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.empty());
        when(notificationSettingsRepository.save(any(NotificationSettings.class)))
            .thenReturn(testSettings);
        when(mapper.toResponse(any(NotificationSettings.class))).thenReturn(settingsResponse);

        // When
        NotificationSettingsResponse result = notificationSettingsService.updateSettings(request);

        // Then
        assertNotNull(result);
        verify(notificationSettingsRepository).save(any(NotificationSettings.class));
    }

    @Test
    void isNotificationEnabled_LowStock_ReturnsTrue() {
        // Given
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.of(testSettings));

        // When
        boolean result = notificationSettingsService.isNotificationEnabled("low_stock");

        // Then
        assertTrue(result);
    }

    @Test
    void isNotificationEnabled_Promotion_ReturnsTrue() {
        // Given
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.of(testSettings));

        // When
        boolean result = notificationSettingsService.isNotificationEnabled("promotion");

        // Then
        assertTrue(result);
    }

    @Test
    void isNotificationEnabled_PurchaseOrder_ReturnsTrue() {
        // Given
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.of(testSettings));

        // When
        boolean result = notificationSettingsService.isNotificationEnabled("purchase_order");

        // Then
        assertTrue(result);
    }

    @Test
    void isNotificationEnabledForAccount_LowStockDisabled_ReturnsFalse() {
        // Given
        testSettings.setLowStockEnabled(false);
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.of(testSettings));

        // When
        boolean result = notificationSettingsService.isNotificationEnabledForAccount(accountId, "low_stock");

        // Then
        assertFalse(result);
    }

    @Test
    void isNotificationEnabledForAccount_NoSettings_ReturnsTrue() {
        // Given
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.empty());

        // When
        boolean result = notificationSettingsService.isNotificationEnabledForAccount(accountId, "low_stock");

        // Then
        assertTrue(result);
    }

    @Test
    void isNotificationEnabledForAccount_UnknownCategory_ReturnsTrue() {
        // Given
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.of(testSettings));

        // When
        boolean result = notificationSettingsService.isNotificationEnabledForAccount(accountId, "unknown_category");

        // Then
        assertTrue(result);
    }

    @Test
    void isNotificationEnabledForAccount_VietnameseCategory_Success() {
        // Given
        when(notificationSettingsRepository.findByAccountId(accountId))
            .thenReturn(Optional.of(testSettings));

        // When
        boolean lowStockResult = notificationSettingsService.isNotificationEnabledForAccount(accountId, "ton_kho_thap");
        boolean promotionResult = notificationSettingsService.isNotificationEnabledForAccount(accountId, "khuyen_mai");
        boolean purchaseOrderResult = notificationSettingsService.isNotificationEnabledForAccount(accountId, "don_nhap_kho");

        // Then
        assertTrue(lowStockResult);
        assertTrue(promotionResult);
        assertTrue(purchaseOrderResult);
    }
}
