package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.PosShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PosShiftRepository extends JpaRepository<PosShift, UUID> {
    Optional<PosShift> findFirstByAccount_AccountIdAndStatusOrderByOpenedAtDesc(UUID accountId, String status);

    List<PosShift> findByAccount_AccountIdOrderByOpenedAtDesc(UUID accountId);
    List<PosShift> findByAccount_AccountIdAndStatusOrderByOpenedAtDesc(UUID accountId, String status);
}
