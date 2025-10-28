package com.g127.snapbuy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "permission_id", columnDefinition = "uniqueidentifier")
    private UUID permissionId;

    @Column(name = "permission_name", nullable = false, length = 50)
    private String permissionName;

    @Column(length = 200)
    private String description;

    @Column(length = 50)
    private String module;

    @Column(name = "active")
    private Boolean isActive = true;
}
