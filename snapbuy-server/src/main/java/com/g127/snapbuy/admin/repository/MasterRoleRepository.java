package com.g127.snapbuy.admin.repository;

import com.g127.snapbuy.admin.entity.MasterRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MasterRoleRepository extends JpaRepository<MasterRole, UUID> {
    
    Optional<MasterRole> findByRoleName(String roleName);
    
    Optional<MasterRole> findByRoleNameIgnoreCase(String roleName);
    
    boolean existsByRoleNameIgnoreCase(String roleName);
    
    List<MasterRole> findByActiveOrderByDisplayOrder(Boolean active);
    
    List<MasterRole> findAllByOrderByDisplayOrder();
    
    // Lấy roles cho tenant (không bao gồm system roles)
    List<MasterRole> findByIsSystemRoleFalseAndActiveOrderByDisplayOrder(Boolean active);
}
