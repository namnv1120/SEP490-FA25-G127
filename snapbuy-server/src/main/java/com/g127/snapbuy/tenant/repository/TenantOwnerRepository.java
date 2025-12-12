package com.g127.snapbuy.tenant.repository;

import com.g127.snapbuy.tenant.entity.TenantOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantOwnerRepository extends JpaRepository<TenantOwner, UUID> {
    Optional<TenantOwner> findByUsername(String username);
    List<TenantOwner> findByTenantId(UUID tenantId);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
}
