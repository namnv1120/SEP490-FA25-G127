package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pos_shift")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PosShift {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "shift_id", columnDefinition = "uniqueidentifier")
    private UUID shiftId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "initial_cash", nullable = false, precision = 18, scale = 2)
    private BigDecimal initialCash;

    @Column(name = "closing_cash", precision = 18, scale = 2)
    private BigDecimal closingCash;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "status", length = 10)
    private String status;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @PrePersist
    void onCreate() {
        if (openedAt == null) openedAt = LocalDateTime.now();
        if (createdDate == null) createdDate = LocalDateTime.now();
        if (updatedDate == null) updatedDate = LocalDateTime.now();
        if (status == null) status = "Mở";
    }

    @PreUpdate
    void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}
