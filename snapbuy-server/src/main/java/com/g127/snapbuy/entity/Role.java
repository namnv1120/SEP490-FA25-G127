package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.*;

@Entity
@Table(name = "roles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "role_id", columnDefinition = "uniqueidentifier")
    private UUID roleId;

    @Column(name = "role_name", nullable = false, length = 50)
    private String roleName;

    @Column(columnDefinition = "nvarchar(max)")
    private String description;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "created_date")
    private Date createdDate;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "role_permission",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();
}

