package com.g127.snapbuy.settings.entity;

import com.g127.snapbuy.account.entity.Account;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pos_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = "account_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "settings_id")
    private UUID settingsId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, unique = true)
    private Account account;

    @Column(name = "tax_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPercent;

    @Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountPercent;

    @Column(name = "loyalty_points_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal loyaltyPointsPercent;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "updated_date", nullable = false)
    private LocalDateTime updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}

