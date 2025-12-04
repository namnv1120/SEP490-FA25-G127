package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Account;
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

    @Query(value = """
           select distinct a.*
           from accounts a
           left join account_roles ar on a.account_id = ar.account_id
           left join roles r on ar.role_id = r.role_id
           where (:keyword is null or :keyword = '' or
                  dbo.RemoveVietnameseDiacritics(lower(a.full_name)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.username)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.email)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.phone)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))))
             and (:active is null or a.active = :active)
             and (:roleName is null or :roleName = '' or r.role_name = :roleName)
           order by a.full_name
           """, nativeQuery = true)
    List<Account> searchAccounts(@Param("keyword") String keyword,
                                 @Param("active") Boolean active,
                                 @Param("roleName") String roleName);

    @Query(value = """
           select distinct a.*
           from accounts a
           left join account_roles ar on a.account_id = ar.account_id
           left join roles r on ar.role_id = r.role_id
           where (:keyword is null or :keyword = '' or
                  dbo.RemoveVietnameseDiacritics(lower(a.full_name)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.username)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.email)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.phone)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))))
             and (:active is null or a.active = :active)
             and (:roleName is null or :roleName = '' or r.role_name = :roleName)
           """,
           countQuery = """
           select count(distinct a.account_id)
           from accounts a
           left join account_roles ar on a.account_id = ar.account_id
           left join roles r on ar.role_id = r.role_id
           where (:keyword is null or :keyword = '' or
                  dbo.RemoveVietnameseDiacritics(lower(a.full_name)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.username)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.email)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.phone)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))))
             and (:active is null or a.active = :active)
             and (:roleName is null or :roleName = '' or r.role_name = :roleName)
           """, nativeQuery = true)
    Page<Account> searchAccountsPage(@Param("keyword") String keyword,
                                     @Param("active") Boolean active,
                                     @Param("roleName") String roleName,
                                     Pageable pageable);

    @Query(value = """
           select distinct a.*
           from accounts a
           left join account_roles ar on a.account_id = ar.account_id
           left join roles r on ar.role_id = r.role_id
           where (:keyword is null or :keyword = '' or
                  dbo.RemoveVietnameseDiacritics(lower(a.full_name)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.username)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.email)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.phone)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))))
             and (:active is null or a.active = :active)
             and r.role_name in (:roleNames)
           """,
           countQuery = """
           select count(distinct a.account_id)
           from accounts a
           left join account_roles ar on a.account_id = ar.account_id
           left join roles r on ar.role_id = r.role_id
           where (:keyword is null or :keyword = '' or
                  dbo.RemoveVietnameseDiacritics(lower(a.full_name)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.username)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.email)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(a.phone)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))))
             and (:active is null or a.active = :active)
             and r.role_name in (:roleNames)
           """, nativeQuery = true)
    Page<Account> searchStaffAccountsPage(@Param("keyword") String keyword,
                                          @Param("active") Boolean active,
                                          @Param("roleNames") java.util.List<String> roleNames,
                                          Pageable pageable);
}
