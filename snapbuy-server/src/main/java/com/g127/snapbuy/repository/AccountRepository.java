package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Account;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, java.util.UUID> {

    Optional<Account> findByUsername(String username);
    Optional<Account> findByEmail(String email);

    @Query("""
           select distinct a
           from Account a
           left join fetch a.roles r
           left join fetch r.permissions p
           where a.username = :username
           """)
    Optional<Account> findByUsernameWithRolesAndPermissions(@Param("username") String username);
}