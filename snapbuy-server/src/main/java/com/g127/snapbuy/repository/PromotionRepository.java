package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PromotionRepository extends JpaRepository<Promotion, UUID> {

    boolean existsByPromotionNameIgnoreCase(String promotionName);

    @Query("""
        select p from Promotion p
        join p.products prod
        where prod.productId = :productId
          and p.active = true
          and p.startDate <= :at
          and p.endDate >= :at
    """)
    List<Promotion> findActivePromotionsForProductAt(@Param("productId") UUID productId,
                                                     @Param("at") LocalDateTime at);

    @Query("""
        select p from Promotion p
        where p.active = true and p.endDate < :now
    """)
    List<Promotion> findExpiredActive(@Param("now") LocalDateTime now);
}






