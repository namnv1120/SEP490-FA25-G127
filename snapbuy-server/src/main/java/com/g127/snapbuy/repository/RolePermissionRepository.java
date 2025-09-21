package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RolePermissionRepository extends JpaRepository<RolePermission, UUID> {

}
