package com.g127.snapbuy.account.repository;

import com.g127.snapbuy.account.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByRoleName(String roleName);
    Optional<Role> findByRoleNameIgnoreCase(String roleName);
    boolean existsByRoleNameIgnoreCase(String roleName);

    // Simple JPQL query - keyword filtering is done in Java layer using VietnameseUtils
    @Query("SELECT r FROM Role r WHERE (:active IS NULL OR r.active = :active)")
    List<Role> findRolesForSearch(@Param("active") Boolean active);
}
