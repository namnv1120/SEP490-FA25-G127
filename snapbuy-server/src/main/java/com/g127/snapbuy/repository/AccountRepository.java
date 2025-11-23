package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Account;
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

    @Query("""
           select distinct a
           from Account a
           left join a.roles r
           where (:keyword is null or :keyword = '' or
                  lower(a.fullName) like lower(concat('%', :keyword, '%')) or
                  lower(a.username) like lower(concat('%', :keyword, '%')) or
                  lower(a.email) like lower(concat('%', :keyword, '%')))
             and (:active is null or a.active = :active)
             and (:roleName is null or :roleName = '' or r.roleName = :roleName)
           order by a.fullName
           """)
    List<Account> searchAccounts(@Param("keyword") String keyword,
                                 @Param("active") Boolean active,
                                 @Param("roleName") String roleName);

    @Query(value = """
           select distinct a
           from Account a
           left join a.roles r
           where (:keyword is null or :keyword = '' or
                  lower(a.fullName) like lower(concat('%', :keyword, '%')) or
                  lower(a.username) like lower(concat('%', :keyword, '%')) or
                  lower(a.email) like lower(concat('%', :keyword, '%')))
             and (:active is null or a.active = :active)
             and (:roleName is null or :roleName = '' or r.roleName = :roleName)
           """,
           countQuery = """
           select count(distinct a)
           from Account a
           left join a.roles r
           where (:keyword is null or :keyword = '' or
                  lower(a.fullName) like lower(concat('%', :keyword, '%')) or
                  lower(a.username) like lower(concat('%', :keyword, '%')) or
                  lower(a.email) like lower(concat('%', :keyword, '%')))
             and (:active is null or a.active = :active)
             and (:roleName is null or :roleName = '' or r.roleName = :roleName)
           """)
    org.springframework.data.domain.Page<Account> searchAccountsPage(@Param("keyword") String keyword,
                                                                     @Param("active") Boolean active,
                                                                     @Param("roleName") String roleName,
                                                                     org.springframework.data.domain.Pageable pageable);

    @Query(value = """
           select distinct a
           from Account a
           left join a.roles r
           where (:keyword is null or :keyword = '' or
                  lower(a.fullName) like lower(concat('%', :keyword, '%')) or
                  lower(a.username) like lower(concat('%', :keyword, '%')) or
                  lower(a.email) like lower(concat('%', :keyword, '%')))
             and (:active is null or a.active = :active)
             and r.roleName in (:roleNames)
           """,
           countQuery = """
           select count(distinct a)
           from Account a
           left join a.roles r
           where (:keyword is null or :keyword = '' or
                  lower(a.fullName) like lower(concat('%', :keyword, '%')) or
                  lower(a.username) like lower(concat('%', :keyword, '%')) or
                  lower(a.email) like lower(concat('%', :keyword, '%')))
             and (:active is null or a.active = :active)
             and r.roleName in (:roleNames)
           """)
    org.springframework.data.domain.Page<Account> searchStaffAccountsPage(@Param("keyword") String keyword,
                                                                          @Param("active") Boolean active,
                                                                          @Param("roleNames") java.util.List<String> roleNames,
                                                                          org.springframework.data.domain.Pageable pageable);
}
