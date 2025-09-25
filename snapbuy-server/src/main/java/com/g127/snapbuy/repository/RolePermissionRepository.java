//package com.g127.snapbuy.repository;
//
//import com.g127.snapbuy.entity.*;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.*;
//
//public interface RolePermissionRepository extends JpaRepository<RolePermission, UUID> {
//    List<RolePermission> findByRole(Role role);
//    Optional<RolePermission> findByRoleAndPermission(Role role, Permission permission);
//    void deleteByRoleAndPermission(Role role, Permission permission);
//}
