package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {}
