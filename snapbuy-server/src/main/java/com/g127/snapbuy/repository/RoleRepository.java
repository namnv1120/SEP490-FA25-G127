package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Role;
import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByRoleName(String roleName);
}
