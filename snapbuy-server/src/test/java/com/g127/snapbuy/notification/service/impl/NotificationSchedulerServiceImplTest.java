package com.g127.snapbuy.notification.service.impl;

import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.Inventory;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.Promotion;
import com.g127.snapbuy.notification.service.NotificationService;
import com.g127.snapbuy.notification.service.NotificationSettingsService;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.InventoryRepository;
import com.g127.snapbuy.repository.NotificationRepository;
import com.g127.snapbuy.repository.PromotionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationSchedulerServiceImplTest {

    @Mock
    private NotificationService notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private NotificationSettingsService notificationSettingsService;

    private NotificationSchedulerServiceImpl notificationSchedulerService;

    private Account testAccount;
    private Inventory testInventory;
    private Product testProduct;
    private Promotion testPromotion;
    private UUID accountId;
    private UUID productId;
    private UUID promotionId;

    @BeforeEach
    void setUp() {
        accountId = UUID.randomUUID();
        productId = UUID.randomUUID();
        promotionId = UUID.randomUUID();

        testAccount = new Account();
        testAccount.setAccountId(accountId);

        testProduct = new Product();
        testProduct.setProductId(productId);
        testProduct.setProductName("Test Product");
        testProduct.setActive(true);

        testInventory = new Inventory();
        testInventory.setInventoryId(UUID.randomUUID());
        testInventory.setProduct(testProduct);
        testInventory.setQuantityInStock(5);
        testInventory.setReorderPoint(10);

        testPromotion = new Promotion();
        testPromotion.setPromotionId(promotionId);
        testPromotion.setPromotionName("Test Promotion");
        testPromotion.setActive(true);
        testPromotion.setEndDate(LocalDateTime.now().plusDays(2));

        notificationSchedulerService = new NotificationSchedulerServiceImpl(
            notificationService,
            notificationRepository,
            inventoryRepository,
            promotionRepository,
            accountRepository,
            notificationSettingsService
        );
    }

    @Test
    void checkLowStock_WithLowStockItems_CreatesNotifications() {
        // Given
        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(testAccount));
        when(inventoryRepository.findAll())
            .thenReturn(Arrays.asList(testInventory));
        when(notificationSettingsService.isNotificationEnabledForAccount(accountId, "low_stock"))
            .thenReturn(true);

        // When
        notificationSchedulerService.checkLowStock();

        // Then
        verify(notificationService, atLeastOnce()).createNotification(
            eq(accountId),
            any(),
            anyString(),
            anyString(),
            eq(productId)
        );
    }

    @Test
    void checkLowStock_WithInactiveProduct_SkipsNotification() {
        // Given
        testProduct.setActive(false);
        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(testAccount));
        when(inventoryRepository.findAll())
            .thenReturn(Arrays.asList(testInventory));

        // When
        notificationSchedulerService.checkLowStock();

        // Then
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any());
    }

    @Test
    void checkLowStock_WithSufficientStock_SkipsNotification() {
        // Given
        testInventory.setQuantityInStock(20); // Above reorder point
        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(testAccount));
        when(inventoryRepository.findAll())
            .thenReturn(Arrays.asList(testInventory));

        // When
        notificationSchedulerService.checkLowStock();

        // Then
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any());
    }

    @Test
    void checkLowStock_WithNoShopOwners_SkipsNotification() {
        // Given
        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Collections.emptyList());

        // When
        notificationSchedulerService.checkLowStock();

        // Then
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any());
    }

    @Test
    void cancelPromotionNotifications_Success() {
        // When
        notificationSchedulerService.cancelPromotionNotifications(promotionId);

        // Then - No exception should be thrown
        // This is a simple test to ensure the method doesn't fail
    }

    @Test
    void checkLowStock_WithNotificationsDisabled_SkipsNotification() {
        // Given
        when(accountRepository.findByRoleName("Chủ cửa hàng"))
            .thenReturn(Arrays.asList(testAccount));
        when(inventoryRepository.findAll())
            .thenReturn(Arrays.asList(testInventory));
        when(notificationSettingsService.isNotificationEnabledForAccount(accountId, "low_stock"))
            .thenReturn(false);

        // When
        notificationSchedulerService.checkLowStock();

        // Then
        verify(notificationService, never()).createNotification(any(), any(), any(), any(), any());
    }
}
