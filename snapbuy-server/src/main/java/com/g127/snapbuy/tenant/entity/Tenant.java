package com.g127.snapbuy.tenant.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {
    
    @Id
    @GeneratedValue
    @Column(name = "tenant_id", columnDefinition = "UNIQUEIDENTIFIER")
    private UUID tenantId;
    
    @Column(name = "tenant_name", nullable = false)
    private String tenantName;
    
    @Column(name = "tenant_code", nullable = false, unique = true, length = 50)
    private String tenantCode;
    
    @Column(name = "db_host", nullable = false)
    private String dbHost;
    
    @Column(name = "db_port", nullable = false)
    private Integer dbPort;
    
    @Column(name = "db_name", nullable = false, unique = true)
    private String dbName;
    
    @Column(name = "db_username", nullable = false)
    private String dbUsername;
    
    @Column(name = "db_password", nullable = false)
    private String dbPassword;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "subscription_start")
    private LocalDateTime subscriptionStart;
    
    @Column(name = "subscription_end")
    private LocalDateTime subscriptionEnd;
    
    @Column(name = "max_users")
    private Integer maxUsers;
    
    @Column(name = "max_products")
    private Integer maxProducts;
}
