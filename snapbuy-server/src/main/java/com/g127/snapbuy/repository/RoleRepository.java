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
           select r.*
           from roles r
           where (:keyword is null or :keyword = '' or
                  dbo.RemoveVietnameseDiacritics(lower(r.role_name)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(r.description)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))))
             and (:active is null or r.active = :active)
           """,
           countQuery = """
           select count(r.role_id)
           from roles r
           where (:keyword is null or :keyword = '' or
                  dbo.RemoveVietnameseDiacritics(lower(r.role_name)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))) or
                  dbo.RemoveVietnameseDiacritics(lower(r.description)) like dbo.RemoveVietnameseDiacritics(lower(concat('%', :keyword, '%'))))
             and (:active is null or r.active = :active)
           """, nativeQuery = true)
    Page<Role> searchRolesPage(@Param("keyword") String keyword,
                                @Param("active") Boolean active,
                                Pageable pageable);
}
