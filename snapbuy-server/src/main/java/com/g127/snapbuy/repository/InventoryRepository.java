package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Inventory;
import com.g127.snapbuy.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    void deleteAllByProduct_ProductId(UUID productId);

    Optional<Inventory> findByProduct(Product product);

    Optional<Inventory> findByProduct_ProductId(UUID productId);

    @Query(value = """
        SELECT TOP 1 *
        FROM inventory WITH (UPDLOCK, ROWLOCK)
        WHERE product_id = :productId
    """, nativeQuery = true)
    Optional<Inventory> lockByProductId(@Param("productId") UUID productId);
}
