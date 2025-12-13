package com.g127.snapbuy.account.repository;

import com.g127.snapbuy.account.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

    @Query("""
           select distinct a
           from Account a
           join a.roles r
           where r.roleName = :roleName
           and a.active = true
           order by a.fullName
           """)
    List<Account> findByRoleName(@Param("roleName") String roleName);

    // Simple JPQL query - keyword filtering is done in Java layer using VietnameseUtils
    @Query("""
           select distinct a
           from Account a
           left join fetch a.roles r
           where (:active is null or a.active = :active)
             and (:roleName is null or :roleName = '' or r.roleName = :roleName)
           order by a.fullName
           """)
    List<Account> findAccountsForSearch(@Param("active") Boolean active,
                                        @Param("roleName") String roleName);

    // Simple JPQL query for staff accounts - keyword filtering is done in Java layer
    @Query("""
           select distinct a
           from Account a
           left join fetch a.roles r
           where (:active is null or a.active = :active)
             and r.roleName in (:roleNames)
           """)
    List<Account> findStaffAccountsForSearch(@Param("active") Boolean active,
                                             @Param("roleNames") java.util.List<String> roleNames);
}
