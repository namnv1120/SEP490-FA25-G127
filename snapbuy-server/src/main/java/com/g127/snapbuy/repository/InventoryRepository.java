package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
}
