package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.Set;

@Entity @Table(name="roles")
@Getter @Setter
public class Role {
    @Id @Column(name="role_id") private UUID roleId;
    @Column(name="role_name", nullable=false, unique=true, length=50) private String roleName;
    @Column(name="display_name", nullable=false, length=100) private String displayName;

    @OneToMany(mappedBy="role", fetch=FetchType.LAZY)
    private Set<UserRole> userRoles;
}
