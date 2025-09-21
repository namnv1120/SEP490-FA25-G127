package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID permissionId;

    @Column(unique = true, nullable = false)
    String permissionName;

    String resource;
    String action;
    String description;
    LocalDateTime createdAt = LocalDateTime.now();
}
