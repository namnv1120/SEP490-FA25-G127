package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Account;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByUsername(String username);
    Optional<Account> findByEmail(String email);


    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhone(String phone);

    @Query("""
           select distinct a
           from Account a
           left join fetch a.roles r
           left join fetch r.permissions p
           where lower(a.username) = lower(:username)
           """)
    Optional<Account> findByUsernameWithRolesAndPermissionsIgnoreCase(@Param("username") String username);

    @Query("""
           select count(a)
           from Account a
           join a.roles r
           where r.roleId = :roleId
           """)
    long countAccountsByRoleId(@Param("roleId") UUID roleId);
}
