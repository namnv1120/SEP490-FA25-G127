package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "purchase_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "purchase_order_id", columnDefinition = "uniqueidentifier")
    private UUID id;

    @Column(name = "purchase_order_number", nullable = false, unique = true)
    private String number;

    @Column(name = "supplier_id", nullable = false)
    private UUID supplierId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "order_date")
    private LocalDateTime orderDate;

    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    @Column(name = "status")
    private String status;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "tax_amount", precision = 18, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "notes")
    private String notes;

    @Column(name = "email_sent_at")
    private LocalDateTime emailSentAt;
}
