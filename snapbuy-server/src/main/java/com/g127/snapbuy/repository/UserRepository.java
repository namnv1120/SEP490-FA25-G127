package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.User;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = {"userRoles","userRoles.role"})
    Optional<User> findWithRolesByUsername(String username);
}
