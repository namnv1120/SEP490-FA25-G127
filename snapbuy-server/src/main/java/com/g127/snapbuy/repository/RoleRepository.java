package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByRoleName(String roleName);
    Optional<Role> findByRoleNameIgnoreCase(String roleName);
    boolean existsByRoleNameIgnoreCase(String roleName);

    @Query(value = """
           select r
           from Role r
           where (:keyword is null or :keyword = '' or
                  lower(r.roleName) like lower(concat('%', :keyword, '%')) or
                  lower(r.description) like lower(concat('%', :keyword, '%')))
             and (:active is null or r.active = :active)
           """,
           countQuery = """
           select count(r)
           from Role r
           where (:keyword is null or :keyword = '' or
                  lower(r.roleName) like lower(concat('%', :keyword, '%')) or
                  lower(r.description) like lower(concat('%', :keyword, '%')))
             and (:active is null or r.active = :active)
           """)
    Page<Role> searchRolesPage(@Param("keyword") String keyword,
                                @Param("active") Boolean active,
                                Pageable pageable);
}
