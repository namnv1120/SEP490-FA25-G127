package com.g127.snapbuy.product.repository;

import com.g127.snapbuy.product.entity.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductPriceRepository extends JpaRepository<ProductPrice, UUID> {
    Optional<ProductPrice> findTopByProduct_ProductIdOrderByValidFromDesc(UUID productId);
    void deleteAllByProduct_ProductId(UUID productId);
    
    // Batch fetch prices for multiple products
    @Query("SELECT p FROM ProductPrice p WHERE p.product.productId IN :productIds")
    List<ProductPrice> findByProductIdIn(@org.springframework.data.repository.query.Param("productIds") List<UUID> productIds);

    @Query("""
        SELECT p FROM ProductPrice p
        WHERE p.product.productId = :productId
        AND (p.validTo IS NULL OR p.validTo > CURRENT_TIMESTAMP)
        ORDER BY p.validFrom DESC
        LIMIT 1
    """)
    Optional<ProductPrice> findCurrentPriceByProductId(UUID productId);

    @Query("""
        select p from ProductPrice p
        where p.product.productId = :productId
          and p.validFrom <= :at
          and (p.validTo is null or p.validTo > :at)
        order by p.validFrom desc
        """)
    Optional<ProductPrice> findEffectivePrice(UUID productId, LocalDateTime at);
}
