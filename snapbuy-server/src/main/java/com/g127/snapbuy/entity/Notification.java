package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notification_id")
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "message", nullable = false, length = 255)
    private String message;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "shop_id")
    private UUID shopId;

    @Column(name = "account_id")
    private UUID accountId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reference_id")
    private UUID referenceId;

    public enum NotificationType {
        TON_KHO_THAP("Tồn kho thấp"),
        KHUYEN_MAI_SAP_HET_HAN("Khuyến mãi sắp hết hạn"),
        KHUYEN_MAI_HET_HAN("Khuyến mãi đã hết hạn"),
        DON_HANG("Đơn hàng"),
        THANH_TOAN("Thanh toán"),
        HE_THONG("Hệ thống"),
        // Đơn đặt hàng (Purchase Order)
        DON_DAT_HANG_CHO_DUYET("Đơn đặt hàng chờ duyệt"),
        DON_DAT_HANG_DA_DUYET("Đơn đặt hàng đã duyệt"),
        DON_DAT_HANG_CHO_XAC_NHAN("Đơn đặt hàng chờ xác nhận"),
        DON_DAT_HANG_HOAN_TAT("Đơn đặt hàng hoàn tất");

        private final String label;

        NotificationType(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }
}
