package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductPriceRepository extends JpaRepository<ProductPrice, UUID> {
}
