package com.g127.snapbuy.settings.service.impl;

import com.g127.snapbuy.settings.dto.request.PosSettingsUpdateRequest;
import com.g127.snapbuy.settings.dto.response.PosSettingsResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.PosSettings;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.PosSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PosSettingsServiceImplTest {

    @Mock
    private PosSettingsRepository posSettingsRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PosSettingsServiceImpl posSettingsService;

    private Account shopOwnerAccount;
    private PosSettings testSettings;
    private UUID settingsId;
    private UUID accountId;

    @BeforeEach
    void setUp() {
        settingsId = UUID.randomUUID();
        accountId = UUID.randomUUID();

        shopOwnerAccount = new Account();
        shopOwnerAccount.setAccountId(accountId);
        shopOwnerAccount.setUsername("shopowner");

        testSettings = PosSettings.builder()
                .settingsId(settingsId)
                .account(shopOwnerAccount)
                .taxPercent(BigDecimal.valueOf(10))
                .discountPercent(BigDecimal.valueOf(5))
                .loyaltyPointsPercent(BigDecimal.valueOf(2))
                .build();
    }

    @Test
    void getSettings_ExistingSettings_Success() {
        // Given
        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(shopOwnerAccount));
        when(posSettingsRepository.findByAccount(shopOwnerAccount))
            .thenReturn(Optional.of(testSettings));

        // When
        PosSettingsResponse result = posSettingsService.getSettings();

        // Then
        assertNotNull(result);
        assertEquals(settingsId, result.getSettingsId());
        assertEquals(BigDecimal.valueOf(10), result.getTaxPercent());
        assertEquals(BigDecimal.valueOf(5), result.getDiscountPercent());
        assertEquals(BigDecimal.valueOf(2), result.getLoyaltyPointsPercent());
    }

    @Test
    void getSettings_NoExistingSettings_CreatesDefault() {
        // Given
        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(shopOwnerAccount));
        when(posSettingsRepository.findByAccount(shopOwnerAccount))
            .thenReturn(Optional.empty())
            .thenReturn(Optional.empty());
        when(posSettingsRepository.save(any(PosSettings.class)))
            .thenReturn(testSettings);

        // When
        PosSettingsResponse result = posSettingsService.getSettings();

        // Then
        assertNotNull(result);
        verify(posSettingsRepository).save(any(PosSettings.class));
    }

    @Test
    void getSettings_NoShopOwner_ThrowsException() {
        // Given
        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Collections.emptyList());

        // When & Then
        assertThrows(NoSuchElementException.class,
            () -> posSettingsService.getSettings());
    }

    @Test
    void updateSettings_AsShopOwner_Success() {
        // Given
        setupShopOwnerSecurityContext();
        PosSettingsUpdateRequest request = new PosSettingsUpdateRequest();
        request.setTaxPercent(BigDecimal.valueOf(15));
        request.setDiscountPercent(BigDecimal.valueOf(10));
        request.setLoyaltyPointsPercent(BigDecimal.valueOf(3));

        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(shopOwnerAccount));
        when(posSettingsRepository.findByAccount(shopOwnerAccount))
            .thenReturn(Optional.of(testSettings));
        when(posSettingsRepository.save(any(PosSettings.class)))
            .thenReturn(testSettings);

        // When
        PosSettingsResponse result = posSettingsService.updateSettings(request);

        // Then
        assertNotNull(result);
        verify(posSettingsRepository).save(any(PosSettings.class));
    }

    @Test
    void updateSettings_AsAdmin_Success() {
        // Given
        setupAdminSecurityContext();
        PosSettingsUpdateRequest request = new PosSettingsUpdateRequest();
        request.setTaxPercent(BigDecimal.valueOf(15));
        request.setDiscountPercent(BigDecimal.valueOf(10));
        request.setLoyaltyPointsPercent(BigDecimal.valueOf(3));

        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(shopOwnerAccount));
        when(posSettingsRepository.findByAccount(shopOwnerAccount))
            .thenReturn(Optional.of(testSettings));
        when(posSettingsRepository.save(any(PosSettings.class)))
            .thenReturn(testSettings);

        // When
        PosSettingsResponse result = posSettingsService.updateSettings(request);

        // Then
        assertNotNull(result);
        verify(posSettingsRepository).save(any(PosSettings.class));
    }

    @Test
    void updateSettings_AsNonAuthorizedUser_ThrowsException() {
        // Given
        setupNonAuthorizedSecurityContext();
        PosSettingsUpdateRequest request = new PosSettingsUpdateRequest();
        request.setTaxPercent(BigDecimal.valueOf(15));

        // When & Then
        assertThrows(AccessDeniedException.class,
            () -> posSettingsService.updateSettings(request));
        verify(posSettingsRepository, never()).save(any(PosSettings.class));
    }

    @Test
    void updateSettings_NoExistingSettings_CreatesNew() {
        // Given
        setupShopOwnerSecurityContext();
        PosSettingsUpdateRequest request = new PosSettingsUpdateRequest();
        request.setTaxPercent(BigDecimal.valueOf(15));
        request.setDiscountPercent(BigDecimal.valueOf(10));
        request.setLoyaltyPointsPercent(BigDecimal.valueOf(3));

        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(shopOwnerAccount));
        when(posSettingsRepository.findByAccount(shopOwnerAccount))
            .thenReturn(Optional.empty());
        when(posSettingsRepository.save(any(PosSettings.class)))
            .thenReturn(testSettings);

        // When
        PosSettingsResponse result = posSettingsService.updateSettings(request);

        // Then
        assertNotNull(result);
        verify(posSettingsRepository).save(argThat(settings -> 
            settings.getAccount() != null && 
            settings.getAccount().equals(shopOwnerAccount)
        ));
    }

    @Test
    void updateSettings_NoShopOwner_ThrowsException() {
        // Given
        setupShopOwnerSecurityContext();
        PosSettingsUpdateRequest request = new PosSettingsUpdateRequest();
        request.setTaxPercent(BigDecimal.valueOf(15));

        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Collections.emptyList());

        // When & Then
        assertThrows(NoSuchElementException.class,
            () -> posSettingsService.updateSettings(request));
        verify(posSettingsRepository, never()).save(any(PosSettings.class));
    }

    // Helper methods
    private void setupShopOwnerSecurityContext() {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_Chủ cửa hàng")
        );
        lenient().when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    private void setupAdminSecurityContext() {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_Quản trị viên")
        );
        lenient().when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    private void setupNonAuthorizedSecurityContext() {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_Nhân viên bán hàng")
        );
        lenient().when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }
}
