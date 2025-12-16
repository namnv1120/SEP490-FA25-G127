package com.g127.snapbuy.inventory.repository;

import com.g127.snapbuy.inventory.entity.Inventory;
import com.g127.snapbuy.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    void deleteAllByProduct_ProductId(UUID productId);

    Optional<Inventory> findByProduct(Product product);

    Optional<Inventory> findByProduct_ProductId(UUID productId);
    
    // Batch fetch inventories for multiple products
    @Query("SELECT i FROM Inventory i WHERE i.product.productId IN :productIds")
    List<Inventory> findByProductIdIn(@Param("productIds") List<UUID> productIds);

    @Query(value = """
        SELECT TOP 1 *
        FROM inventory WITH (UPDLOCK, ROWLOCK)
        WHERE product_id = :productId
    """, nativeQuery = true)
    Optional<Inventory> lockByProductId(@Param("productId") UUID productId);
}
