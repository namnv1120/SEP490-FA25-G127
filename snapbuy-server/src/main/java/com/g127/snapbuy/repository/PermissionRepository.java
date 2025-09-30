package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    Optional<Permission> findByPermissionNameIgnoreCase(String permissionName);

    boolean existsByPermissionNameIgnoreCase(String permissionName);
}
