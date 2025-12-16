package com.g127.snapbuy.settings.service.impl;

import com.g127.snapbuy.settings.dto.request.PosSettingsUpdateRequest;
import com.g127.snapbuy.settings.dto.response.PosSettingsResponse;
import com.g127.snapbuy.account.entity.Account;
import com.g127.snapbuy.settings.entity.PosSettings;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.settings.repository.PosSettingsRepository;
import com.g127.snapbuy.settings.service.PosSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PosSettingsServiceImpl implements PosSettingsService {

    private final PosSettingsRepository posSettingsRepository;
    private final AccountRepository accountRepository;

    private UUID resolveCurrentAccountId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Không xác định được tài khoản đăng nhập");
        }
        String username = auth.getName();
        return accountRepository.findByUsername(username)
                .map(Account::getAccountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản: " + username));
    }

    private boolean isShopOwnerOrAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> {
                    String authority = a.getAuthority();
                    return "ROLE_Chủ cửa hàng".equalsIgnoreCase(authority) ||
                           "ROLE_Quản trị viên".equalsIgnoreCase(authority);
                });
    }

    private Account findShopOwnerAccount() {
        List<Account> shopOwners = accountRepository.findByRoleName("Chủ cửa hàng");
        if (shopOwners == null || shopOwners.isEmpty()) {
            throw new NoSuchElementException("Không tìm thấy tài khoản chủ cửa hàng. Vui lòng tạo tài khoản chủ cửa hàng trước.");
        }
        return shopOwners.get(0);
    }

    @Override
    @Transactional
    public PosSettingsResponse getSettings() {
        // Luôn trả về settings của chủ cửa hàng (global settings)
        Account shopOwner = findShopOwnerAccount();
        PosSettings settings = posSettingsRepository.findByAccount(shopOwner)
                .orElseGet(() -> createDefaultSettings(shopOwner));

        return PosSettingsResponse.builder()
                .settingsId(settings.getSettingsId())
                .taxPercent(settings.getTaxPercent())
                .discountPercent(settings.getDiscountPercent())
                .loyaltyPointsPercent(settings.getLoyaltyPointsPercent())
                .createdDate(settings.getCreatedDate())
                .updatedDate(settings.getUpdatedDate())
                .build();
    }

    private PosSettings createDefaultSettings(Account shopOwner) {
        // Kiểm tra lại một lần nữa để tránh race condition
        return posSettingsRepository.findByAccount(shopOwner)
                .orElseGet(() -> {
                    // Nếu chưa có settings của chủ cửa hàng, tạo mặc định
                    PosSettings defaultSettings = PosSettings.builder()
                            .account(shopOwner)
                            .taxPercent(BigDecimal.ZERO)
                            .discountPercent(BigDecimal.ZERO)
                            .loyaltyPointsPercent(BigDecimal.ZERO)
                            .build();
                    try {
                        return posSettingsRepository.save(defaultSettings);
                    } catch (DataIntegrityViolationException e) {
                        // Nếu bị duplicate (do race condition), tìm lại
                        return posSettingsRepository.findByAccount(shopOwner)
                                .orElseThrow(() -> new IllegalStateException("Không thể tạo settings cho chủ cửa hàng"));
                    }
                });
    }

    @Override
    @Transactional
    public PosSettingsResponse updateSettings(PosSettingsUpdateRequest request) {
        // Chỉ cho phép chủ cửa hàng hoặc quản trị viên update settings
        if (!isShopOwnerOrAdmin()) {
            throw new AccessDeniedException("Chỉ chủ cửa hàng hoặc quản trị viên mới có quyền cập nhật cài đặt POS");
        }

        // Tìm hoặc tạo settings cho chủ cửa hàng
        Account shopOwner = findShopOwnerAccount();
        PosSettings settings = posSettingsRepository.findByAccount(shopOwner)
                .orElseGet(() -> PosSettings.builder()
                        .account(shopOwner)
                        .build());

        settings.setTaxPercent(request.getTaxPercent());
        settings.setDiscountPercent(request.getDiscountPercent());
        settings.setLoyaltyPointsPercent(request.getLoyaltyPointsPercent());
        // Đảm bảo account được set (nếu là record mới)
        if (settings.getAccount() == null) {
            settings.setAccount(shopOwner);
        }

        PosSettings saved = posSettingsRepository.save(settings);

        return PosSettingsResponse.builder()
                .settingsId(saved.getSettingsId())
                .taxPercent(saved.getTaxPercent())
                .discountPercent(saved.getDiscountPercent())
                .loyaltyPointsPercent(saved.getLoyaltyPointsPercent())
                .createdDate(saved.getCreatedDate())
                .updatedDate(saved.getUpdatedDate())
                .build();
    }
}

