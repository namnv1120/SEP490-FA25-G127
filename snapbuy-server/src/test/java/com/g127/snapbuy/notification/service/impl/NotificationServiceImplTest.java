package com.g127.snapbuy.notification.service.impl;

import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.Notification;
import com.g127.snapbuy.entity.Notification.NotificationType;
import com.g127.snapbuy.mapper.NotificationMapper;
import com.g127.snapbuy.notification.dto.response.NotificationResponse;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.NotificationRepository;
import com.g127.snapbuy.response.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private Account testAccount;
    private Account shopOwner;
    private Notification testNotification;
    private NotificationResponse testNotificationResponse;
    private UUID accountId;
    private UUID shopOwnerId;
    private UUID notificationId;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        accountId = UUID.randomUUID();
        shopOwnerId = UUID.randomUUID();
        notificationId = UUID.randomUUID();
        pageable = PageRequest.of(0, 10);

        testAccount = new Account();
        testAccount.setAccountId(accountId);
        testAccount.setUsername("testuser");

        shopOwner = new Account();
        shopOwner.setAccountId(shopOwnerId);
        shopOwner.setUsername("shopowner");

        testNotification = Notification.builder()
                .shopId(shopOwnerId)
                .accountId(accountId)
                .type(NotificationType.TON_KHO_THAP)
                .message("Test notification")
                .description("Test description")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        testNotificationResponse = NotificationResponse.builder()
                .type(NotificationType.TON_KHO_THAP)
                .message("Test notification")
                .description("Test description")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        // Setup security context
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getAllNotifications_WithNoFilters_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));

        Page<Notification> page = new PageImpl<>(Arrays.asList(testNotification));
        when(notificationRepository.findByShopIdOrAccountIdOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(pageable))).thenReturn(page);
        when(notificationMapper.toResponse(any(Notification.class))).thenReturn(testNotificationResponse);

        // When
        PageResponse<NotificationResponse> result = notificationService.getAllNotifications(null, null, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
        verify(notificationRepository).findByShopIdOrAccountIdOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(pageable));
    }

    @Test
    void getAllNotifications_WithTypeFilter_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));

        Page<Notification> page = new PageImpl<>(Arrays.asList(testNotification));
        when(notificationRepository.findByShopIdOrAccountIdAndTypeOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(NotificationType.TON_KHO_THAP), eq(pageable))).thenReturn(page);
        when(notificationMapper.toResponse(any(Notification.class))).thenReturn(testNotificationResponse);

        // When
        PageResponse<NotificationResponse> result = notificationService.getAllNotifications(
                null, NotificationType.TON_KHO_THAP, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(notificationRepository).findByShopIdOrAccountIdAndTypeOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(NotificationType.TON_KHO_THAP), eq(pageable));
    }

    @Test
    void getAllNotifications_WithIsReadFilter_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));

        Page<Notification> page = new PageImpl<>(Arrays.asList(testNotification));
        when(notificationRepository.findByShopIdOrAccountIdAndIsReadOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(false), eq(pageable))).thenReturn(page);
        when(notificationMapper.toResponse(any(Notification.class))).thenReturn(testNotificationResponse);

        // When
        PageResponse<NotificationResponse> result = notificationService.getAllNotifications(
                false, null, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(notificationRepository).findByShopIdOrAccountIdAndIsReadOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(false), eq(pageable));
    }

    @Test
    void getAllNotifications_WithAllFilters_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));

        Page<Notification> page = new PageImpl<>(Arrays.asList(testNotification));
        when(notificationRepository.findByShopIdOrAccountIdAndTypeAndIsReadOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(NotificationType.TON_KHO_THAP), eq(false), eq(pageable))).thenReturn(page);
        when(notificationMapper.toResponse(any(Notification.class))).thenReturn(testNotificationResponse);

        // When
        PageResponse<NotificationResponse> result = notificationService.getAllNotifications(
                false, NotificationType.TON_KHO_THAP, pageable);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(notificationRepository).findByShopIdOrAccountIdAndTypeAndIsReadOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(NotificationType.TON_KHO_THAP), eq(false), eq(pageable));
    }

    @Test
    void getUnreadCount_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));
        when(notificationRepository.countByShopIdOrAccountIdAndIsRead(shopOwnerId, accountId, false))
                .thenReturn(5L);

        // When
        Long count = notificationService.getUnreadCount();

        // Then
        assertThat(count).isEqualTo(5L);
        verify(notificationRepository).countByShopIdOrAccountIdAndIsRead(shopOwnerId, accountId, false);
    }

    @Test
    void markAsRead_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);
        when(notificationMapper.toResponse(any(Notification.class))).thenReturn(testNotificationResponse);

        // When
        NotificationResponse result = notificationService.markAsRead(notificationId);

        // Then
        assertThat(result).isNotNull();
        assertThat(testNotification.getIsRead()).isTrue();
        verify(notificationRepository).save(testNotification);
    }

    @Test
    void markAsRead_NotificationNotFound_ThrowsException() {
        // Given
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> notificationService.markAsRead(notificationId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Notification not found");
    }

    @Test
    void markAsRead_UnauthorizedAccess_ThrowsException() {
        // Given
        UUID unauthorizedAccountId = UUID.randomUUID();
        UUID unauthorizedShopId = UUID.randomUUID();
        
        Notification unauthorizedNotification = Notification.builder()
                .shopId(unauthorizedShopId)
                .accountId(unauthorizedAccountId)
                .type(NotificationType.TON_KHO_THAP)
                .message("Test")
                .isRead(false)
                .build();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(unauthorizedNotification));

        // When & Then
        assertThatThrownBy(() -> notificationService.markAsRead(notificationId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Unauthorized access");
    }

    @Test
    void markAllAsRead_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));

        Notification notification1 = Notification.builder()
                .shopId(shopOwnerId)
                .isRead(false)
                .build();
        Notification notification2 = Notification.builder()
                .accountId(accountId)
                .isRead(false)
                .build();

        Page<Notification> unreadPage = new PageImpl<>(Arrays.asList(notification1, notification2));
        when(notificationRepository.findByShopIdOrAccountIdAndIsReadOrderByCreatedAtDesc(
                eq(shopOwnerId), eq(accountId), eq(false), any(Pageable.class))).thenReturn(unreadPage);

        // When
        notificationService.markAllAsRead();

        // Then
        assertThat(notification1.getIsRead()).isTrue();
        assertThat(notification2.getIsRead()).isTrue();
        verify(notificationRepository).saveAll(anyList());
    }

    @Test
    void deleteNotification_Success() {
        // Given
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(testNotification));

        // When
        notificationService.deleteNotification(notificationId);

        // Then
        verify(notificationRepository).delete(testNotification);
    }

    @Test
    void deleteNotification_NotificationNotFound_ThrowsException() {
        // Given
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> notificationService.deleteNotification(notificationId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Notification not found");
    }

    @Test
    void deleteNotification_UnauthorizedAccess_ThrowsException() {
        // Given
        UUID unauthorizedAccountId = UUID.randomUUID();
        UUID unauthorizedShopId = UUID.randomUUID();
        
        Notification unauthorizedNotification = Notification.builder()
                .shopId(unauthorizedShopId)
                .accountId(unauthorizedAccountId)
                .type(NotificationType.TON_KHO_THAP)
                .message("Test")
                .isRead(false)
                .build();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(Arrays.asList(shopOwner));
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(unauthorizedNotification));

        // When & Then
        assertThatThrownBy(() -> notificationService.deleteNotification(notificationId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Unauthorized access");
    }

    @Test
    void createNotification_Success() {
        // Given
        UUID shopId = UUID.randomUUID();
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        // When
        notificationService.createNotification(
                shopId, NotificationType.TON_KHO_THAP, "Test message", "Test description", UUID.randomUUID());

        // Then
        verify(notificationRepository).save(any(Notification.class));
        verify(notificationRepository).flush();
    }

    @Test
    void createNotification_NullShopId_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> notificationService.createNotification(
                null, NotificationType.TON_KHO_THAP, "Test message", "Test description", UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Shop ID cannot be null");
    }

    @Test
    void createNotification_NullType_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> notificationService.createNotification(
                UUID.randomUUID(), null, "Test message", "Test description", UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Notification type cannot be null");
    }

    @Test
    void createNotificationForAccount_Success() {
        // Given
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        // When
        notificationService.createNotificationForAccount(
                accountId, NotificationType.DON_HANG, "Test message", "Test description", UUID.randomUUID());

        // Then
        verify(notificationRepository).save(any(Notification.class));
        verify(notificationRepository).flush();
    }

    @Test
    void createNotificationForAccount_NullAccountId_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> notificationService.createNotificationForAccount(
                null, NotificationType.DON_HANG, "Test message", "Test description", UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Account ID cannot be null");
    }

    @Test
    void createNotificationForAccount_NullType_ThrowsException() {
        // When & Then
        assertThatThrownBy(() -> notificationService.createNotificationForAccount(
                accountId, null, "Test message", "Test description", UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Notification type cannot be null");
    }
}
