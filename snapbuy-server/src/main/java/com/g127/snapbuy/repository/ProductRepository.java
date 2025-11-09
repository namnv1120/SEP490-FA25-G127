package com.g127.snapbuy.repository;

import com.g127.snapbuy.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findByProductCode(String productCode);
    boolean existsByProductCode(String productCode);
    List<Product> findBySupplier_SupplierId(UUID supplierId);
    Optional<Product> findByBarcode(String barcode);
    boolean existsByBarcode(String barcode);

}
