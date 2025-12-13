package com.g127.snapbuy.notification.repository;

import com.g127.snapbuy.notification.entity.NotificationSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, UUID> {
    
    Optional<NotificationSettings> findByAccountId(UUID accountId);
    
    boolean existsByAccountId(UUID accountId);
}



