package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.Set;

@Entity @Table(name="users")
@Getter @Setter
public class User {
    @Id @Column(name="user_id") private UUID userId;
    @Column(nullable=false, unique=true, length=50) private String username;
    @Column(nullable=false, unique=true, length=100) private String email;
    @Column(nullable=false, length=255) private String password;
    @Column(name="full_name", nullable=false, length=100) private String fullName;
    @Column(name="is_active") private Boolean isActive = true;
    @Column(name="email_verified") private Boolean emailVerified = false;
    @Column(name="last_login") private OffsetDateTime lastLogin;

    @OneToMany(mappedBy="user", fetch=FetchType.LAZY)
    private Set<UserRole> userRoles;
}
