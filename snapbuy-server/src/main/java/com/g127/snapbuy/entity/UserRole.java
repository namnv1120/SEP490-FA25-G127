package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity @Table(name="user_roles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id","role_id"})
})
@Getter @Setter
public class UserRole {
    @Id @Column(name="user_role_id") private UUID userRoleId;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="role_id", nullable=false)
    private Role role;

    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="assigned_by")
    private User assignedBy;

    @Column(name="assigned_at") private OffsetDateTime assignedAt;
}
