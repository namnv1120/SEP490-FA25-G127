package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.PosSettingsUpdateRequest;
import com.g127.snapbuy.dto.response.PosSettingsResponse;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.PosSettings;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.PosSettingsRepository;
import com.g127.snapbuy.service.PosSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Override
    public PosSettingsResponse getSettings() {
        UUID currentAccountId = resolveCurrentAccountId();
        Account account = accountRepository.findById(currentAccountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        PosSettings settings = posSettingsRepository.findByAccount(account)
                .orElseGet(() -> {
                    // Nếu chưa có settings, tạo mặc định cho chủ cửa hàng này
                    PosSettings defaultSettings = PosSettings.builder()
                            .account(account)
                            .taxPercent(BigDecimal.ZERO)
                            .discountPercent(BigDecimal.ZERO)
                            .build();
                    return posSettingsRepository.save(defaultSettings);
                });

        return PosSettingsResponse.builder()
                .settingsId(settings.getSettingsId())
                .taxPercent(settings.getTaxPercent())
                .discountPercent(settings.getDiscountPercent())
                .createdDate(settings.getCreatedDate())
                .updatedDate(settings.getUpdatedDate())
                .build();
    }

    @Override
    @Transactional
    public PosSettingsResponse updateSettings(PosSettingsUpdateRequest request) {
        UUID currentAccountId = resolveCurrentAccountId();
        Account account = accountRepository.findById(currentAccountId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy tài khoản"));

        PosSettings settings = posSettingsRepository.findByAccount(account)
                .orElseGet(() -> PosSettings.builder()
                        .account(account)
                        .build());

        settings.setTaxPercent(request.getTaxPercent());
        settings.setDiscountPercent(request.getDiscountPercent());
        // Đảm bảo account được set (nếu là record mới)
        if (settings.getAccount() == null) {
            settings.setAccount(account);
        }

        PosSettings saved = posSettingsRepository.save(settings);

        return PosSettingsResponse.builder()
                .settingsId(saved.getSettingsId())
                .taxPercent(saved.getTaxPercent())
                .discountPercent(saved.getDiscountPercent())
                .createdDate(saved.getCreatedDate())
                .updatedDate(saved.getUpdatedDate())
                .build();
    }
}

