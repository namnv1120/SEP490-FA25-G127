package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"account_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "settings_id")
    private UUID settingsId;

    @Column(name = "account_id", nullable = false, unique = true)
    private UUID accountId;

    // Tồn kho thấp
    @Column(name = "low_stock_enabled", nullable = false)
    @Builder.Default
    private Boolean lowStockEnabled = true;

    // Khuyến mãi (bao gồm cả sắp hết hạn và đã hết hạn)
    @Column(name = "promotion_enabled", nullable = false)
    @Builder.Default
    private Boolean promotionEnabled = true;

    // Đơn nhập kho (Purchase orders)
    @Column(name = "purchase_order_enabled", nullable = false)
    @Builder.Default
    private Boolean purchaseOrderEnabled = true;

    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "updated_date")
    private LocalDateTime updatedDate = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (createdDate == null) createdDate = LocalDateTime.now();
        if (updatedDate == null) updatedDate = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedDate = LocalDateTime.now();
    }
}



