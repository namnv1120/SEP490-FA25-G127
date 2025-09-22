package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "permissions")
@Data @NoArgsConstructor @AllArgsConstructor
public class Permission {
    @Id
    @Column(name = "permission_id")
    private UUID permissionId;

    @Column(name = "permission_name", unique = true, nullable = false, length = 100)
    private String permissionName;

    @Column(name = "resource", length = 50)
    private String resource;

    @Column(name = "action", length = 50)
    private String action;

    @Column(name = "description")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (permissionId == null) permissionId = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
