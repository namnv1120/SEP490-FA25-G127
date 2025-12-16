package com.g127.snapbuy.tenant.repository;

import com.g127.snapbuy.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByTenantCode(String tenantCode);
    Optional<Tenant> findByDbName(String dbName);
    boolean existsByTenantCode(String tenantCode);
}
