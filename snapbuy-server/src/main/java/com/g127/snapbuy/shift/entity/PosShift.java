package com.g127.snapbuy.shift.entity;

import com.g127.snapbuy.account.entity.Account;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "opened_by_account_id")
    private Account openedBy;

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

    @Column(name = "closing_note")
    private String closingNote;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @OneToMany(mappedBy = "shift", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ShiftCashDenomination> cashDenominations = new ArrayList<>();

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
