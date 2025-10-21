package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Inventory;
import com.g127.snapbuy.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findByProduct(Product product);
    Optional<Inventory> findByProduct_ProductId(UUID productId);
}
