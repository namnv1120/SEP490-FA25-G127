package com.g127.snapbuy.admin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.UUID;

@Entity
@Table(name = "master_roles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class MasterRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "role_id", columnDefinition = "uniqueidentifier")
    private UUID roleId;

    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private String roleName;

    @Column(columnDefinition = "nvarchar(max)")
    private String description;

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "created_date")
    private Date createdDate;

    @Column(name = "is_system_role")
    private Boolean isSystemRole = false; // Admin và Chủ cửa hàng không được xóa/sửa

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
