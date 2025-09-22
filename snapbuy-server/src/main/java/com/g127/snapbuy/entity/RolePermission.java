package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "role_permissions")
@Data @NoArgsConstructor @AllArgsConstructor
public class RolePermission {
    @Id
    @Column(name = "role_permission_id")
    private UUID rolePermissionId;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @Column(name = "granted")
    private Boolean granted = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (rolePermissionId == null) rolePermissionId = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
