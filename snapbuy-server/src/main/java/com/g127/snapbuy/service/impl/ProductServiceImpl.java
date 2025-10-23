package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.ProductCreateRequest;
import com.g127.snapbuy.dto.request.ProductImportRequest;
import com.g127.snapbuy.dto.request.ProductUpdateRequest;
import com.g127.snapbuy.dto.response.ProductResponse;
import com.g127.snapbuy.entity.Category;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.ProductPrice;
import com.g127.snapbuy.entity.Supplier;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.ProductMapper;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductPriceRepository productPriceRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponse createProduct(ProductCreateRequest request) {
        Product product = productMapper.toEntity(request);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        product.setCategory(category);

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
            product.setSupplier(supplier);
        }

        product.setCreatedDate(LocalDateTime.now());
        product.setUpdatedDate(LocalDateTime.now());
        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse updateProduct(UUID id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productMapper.updateEntity(product, request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
            product.setSupplier(supplier);
        }

        product.setUpdatedDate(LocalDateTime.now());

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductResponse response = productMapper.toResponse(product);

        ProductPrice latestPrice = productPriceRepository
                .findTopByProduct_ProductIdOrderByValidFromDesc(product.getProductId())
                .orElse(null);

        if (latestPrice != null) {
            response.setUnitPrice(latestPrice.getUnitPrice());
            response.setCostPrice(latestPrice.getCostPrice());
        }

        return response;
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toResponse(product);

                    ProductPrice latestPrice = productPriceRepository
                            .findTopByProduct_ProductIdOrderByValidFromDesc(product.getProductId())
                            .orElse(null);

                    if (latestPrice != null) {
                        response.setUnitPrice(latestPrice.getUnitPrice());
                        response.setCostPrice(latestPrice.getCostPrice());
                    }

                    return response;
                })
                .toList();
    }

    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // 🧹 Xoá dữ liệu phụ thuộc trước
        productPriceRepository.deleteAllByProduct_ProductId(id);
        inventoryRepository.deleteAllByProduct_ProductId(id);


        // 🗑️ Cuối cùng xoá product
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public List<ProductResponse> importProducts(List<ProductImportRequest> requests) {
        log.info("📦 Starting import of {} products", requests.size());

        List<ProductResponse> importedProducts = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < requests.size(); i++) {
            ProductImportRequest request = requests.get(i);
            int rowNumber = i + 1;

            try {
                // 1. Check duplicate product code
                if (productRepository.existsByProductCode(request.getProductCode())) {
                    String error = String.format("Row %d: Product code '%s' already exists",
                            rowNumber, request.getProductCode());
                    log.warn("⚠️ {}", error);
                    errors.add(error);
                    continue;
                }

                // 2. Find category by name (case-insensitive)
                Category category = categoryRepository.findByCategoryNameIgnoreCase(request.getCategoryName())
                        .orElseThrow(() -> {
                            String error = String.format("Row %d: Category '%s' not found",
                                    rowNumber, request.getCategoryName());
                            log.error("❌ {}", error);
                            return new RuntimeException(error);
                        });

                // 3. Find supplier by name (case-insensitive)
                Supplier supplier = supplierRepository.findBySupplierNameIgnoreCase(request.getSupplierName())
                        .orElseThrow(() -> {
                            String error = String.format("Row %d: Supplier '%s' not found",
                                    rowNumber, request.getSupplierName());
                            log.error("❌ {}", error);
                            return new RuntimeException(error);
                        });

                // 4. Create product entity
                Product product = new Product();
                product.setProductCode(request.getProductCode());
                product.setProductName(request.getProductName());
                product.setDescription(request.getDescription());
                product.setCategory(category);
                product.setSupplier(supplier);
                product.setUnit(request.getUnit());
                product.setDimensions(request.getDimensions());
                product.setImageUrl(request.getImageUrl());

                // 5. Save product
                Product savedProduct = productRepository.save(product);
                importedProducts.add(productMapper.toResponse(savedProduct));

                log.info("✅ Row {}: Product '{}' imported successfully", rowNumber, request.getProductCode());

            } catch (Exception e) {
                String error = String.format("Row %d: %s", rowNumber, e.getMessage());
                log.error("❌ {}", error);
                errors.add(error);
            }
        }

        // Log summary
        if (!errors.isEmpty()) {
            log.warn("⚠️ Import completed with {} errors:", errors.size());
            errors.forEach(log::warn);
        }

        log.info("✅ Import summary: {} successful, {} failed out of {} total",
                importedProducts.size(), errors.size(), requests.size());

        return importedProducts;
    }

}
