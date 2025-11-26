package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.ShiftCashDenomination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShiftCashDenominationRepository extends JpaRepository<ShiftCashDenomination, UUID> {
    List<ShiftCashDenomination> findByShift_ShiftId(UUID shiftId);
}

