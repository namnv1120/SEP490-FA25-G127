package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ProductPriceRepository extends JpaRepository<ProductPrice, UUID> {
    @Query("""
        SELECT p FROM ProductPrice p
        WHERE p.product.productId = :productId
        AND (p.validTo IS NULL OR p.validTo > CURRENT_TIMESTAMP)
        ORDER BY p.validFrom DESC
        LIMIT 1
    """)
    Optional<ProductPrice> findCurrentPriceByProductId(UUID productId);
}
