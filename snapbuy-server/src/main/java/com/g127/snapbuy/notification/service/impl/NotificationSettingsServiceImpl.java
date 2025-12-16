package com.g127.snapbuy.notification.service.impl;

import com.g127.snapbuy.notification.dto.request.NotificationSettingsUpdateRequest;
import com.g127.snapbuy.notification.dto.response.NotificationSettingsResponse;
import com.g127.snapbuy.account.entity.Account;
import com.g127.snapbuy.notification.entity.NotificationSettings;
import com.g127.snapbuy.notification.mapper.NotificationSettingsMapper;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.notification.repository.NotificationSettingsRepository;
import com.g127.snapbuy.notification.service.NotificationSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationSettingsServiceImpl implements NotificationSettingsService {

    private final NotificationSettingsRepository notificationSettingsRepository;
    private final AccountRepository accountRepository;
    private final NotificationSettingsMapper mapper;

    private UUID getCurrentAccountId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Không xác định được tài khoản đăng nhập");
        }
        String username = auth.getName();
        return accountRepository.findByUsername(username)
                .map(Account::getAccountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + username));
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationSettingsResponse getSettings() {
        UUID accountId = getCurrentAccountId();
        NotificationSettings settings = notificationSettingsRepository.findByAccountId(accountId)
                .orElseGet(() -> createDefaultSettings(accountId));
        return mapper.toResponse(settings);
    }

    private NotificationSettings createDefaultSettings(UUID accountId) {
        // Kiểm tra lại một lần nữa để tránh race condition
        return notificationSettingsRepository.findByAccountId(accountId)
                .orElseGet(() -> {
                    NotificationSettings defaultSettings = NotificationSettings.builder()
                            .accountId(accountId)
                            .lowStockEnabled(true)
                            .promotionEnabled(true)
                            .purchaseOrderEnabled(true)
                            .build();
                    try {
                        return notificationSettingsRepository.save(defaultSettings);
                    } catch (DataIntegrityViolationException e) {
                        // Nếu bị duplicate (do race condition), tìm lại
                        return notificationSettingsRepository.findByAccountId(accountId)
                                .orElseThrow(() -> new IllegalStateException("Không thể tạo settings cho tài khoản"));
                    }
                });
    }

    @Override
    @Transactional
    public NotificationSettingsResponse updateSettings(NotificationSettingsUpdateRequest request) {
        UUID accountId = getCurrentAccountId();
        
        NotificationSettings settings = notificationSettingsRepository.findByAccountId(accountId)
                .orElseGet(() -> NotificationSettings.builder()
                        .accountId(accountId)
                        .lowStockEnabled(true)
                        .promotionEnabled(true)
                        .purchaseOrderEnabled(true)
                        .build());

        mapper.updateEntity(settings, request);
        NotificationSettings saved = notificationSettingsRepository.save(settings);
        
        log.info("Updated notification settings for account {}: lowStock={}, promotion={}, purchaseOrder={}",
                accountId, saved.getLowStockEnabled(), saved.getPromotionEnabled(), saved.getPurchaseOrderEnabled());
        
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isNotificationEnabled(String notificationCategory) {
        UUID accountId = getCurrentAccountId();
        return isNotificationEnabledForAccount(accountId, notificationCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isNotificationEnabledForAccount(UUID accountId, String notificationCategory) {
        NotificationSettings settings = notificationSettingsRepository.findByAccountId(accountId)
                .orElseGet(() -> {
                    // Default: all enabled
                    return NotificationSettings.builder()
                            .lowStockEnabled(true)
                            .promotionEnabled(true)
                            .purchaseOrderEnabled(true)
                            .build();
                });

        return switch (notificationCategory.toLowerCase()) {
            case "low_stock", "ton_kho_thap" -> settings.getLowStockEnabled() != null && settings.getLowStockEnabled();
            case "promotion", "khuyen_mai" -> settings.getPromotionEnabled() != null && settings.getPromotionEnabled();
            case "purchase_order", "don_nhap_kho", "don_dat_hang" -> settings.getPurchaseOrderEnabled() != null && settings.getPurchaseOrderEnabled();
            default -> true; // Default: enabled if category not recognized
        };
    }
}

