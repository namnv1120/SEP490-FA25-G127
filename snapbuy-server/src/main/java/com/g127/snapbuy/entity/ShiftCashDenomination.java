package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shift_cash_denominations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftCashDenomination {

    public static final String TYPE_OPENING = "Mở";
    public static final String TYPE_CLOSING = "Đóng";

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", columnDefinition = "uniqueidentifier")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private PosShift shift;

    @Column(name = "denomination", nullable = false)
    private Integer denomination; // 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "total_value", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalValue;

    @Column(name = "denomination_type", length = 10)
    @Builder.Default
    private String denominationType = TYPE_CLOSING;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @PrePersist
    void onCreate() {
        if (createdDate == null) createdDate = LocalDateTime.now();
        if (totalValue == null && denomination != null && quantity != null) {
            totalValue = BigDecimal.valueOf(denomination).multiply(BigDecimal.valueOf(quantity));
        }
        if (denominationType == null) denominationType = TYPE_CLOSING;
    }
}

