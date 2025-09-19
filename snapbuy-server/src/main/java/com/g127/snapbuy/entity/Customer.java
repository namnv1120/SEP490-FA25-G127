package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "customer_id", updatable = false, nullable = false)
    private UUID customerId;

    @Column(name = "customer_code", length = 20, nullable = false, unique = true)
    private String customerCode;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(name = "email", length = 100, unique = true)
    private String email;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "address", columnDefinition = "NVARCHAR(MAX)")
    private String address;

    @Column(name = "city", length = 50)
    private String city;

    @Column(name = "district", length = 50)
    private String district;

    @Column(name = "ward", length = 50)
    private String ward;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 20)
    private String gender;  // "Male", "Female", "Other"

    @Column(name = "customer_type", length = 20)
    private String customerType; // "Individual", "Business"

    @Column(name = "tax_code", length = 20)
    private String taxCode;

    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "status", length = 20)
    private String status; // "Active", "Inactive"

    @Column(name = "created_at", columnDefinition = "DATETIME2")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "DATETIME2")
    private LocalDateTime updatedAt;
}
