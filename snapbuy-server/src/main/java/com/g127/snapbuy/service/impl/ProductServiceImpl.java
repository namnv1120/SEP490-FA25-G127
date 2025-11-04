package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.ProductCreateRequest;
import com.g127.snapbuy.dto.request.ProductImportRequest;
import com.g127.snapbuy.dto.request.ProductUpdateRequest;
import com.g127.snapbuy.dto.response.ProductResponse;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.ProductMapper;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

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

    @Value("${upload.dir}")
    private String uploadDir;

    @Override
    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request) {
        Product product = productMapper.toEntity(request);

        // Category
        Category category = categoryRepository.findById(UUID.fromString(request.getCategoryId()))
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        product.setCategory(category);

        // Supplier
        if (request.getSupplierId() != null && !request.getSupplierId().isEmpty()) {
            Supplier supplier = supplierRepository.findById(UUID.fromString(request.getSupplierId()))
                    .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
            product.setSupplier(supplier);
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + request.getImage().getOriginalFilename();

                Path uploadPath = Paths.get(uploadDir, "products").toAbsolutePath();

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName);
                request.getImage().transferTo(filePath.toFile());

                product.setImageUrl("/uploads/products/" + fileName);

                log.info("✅ Saved image: {}", product.getImageUrl());

            } catch (Exception e) {
                log.error("❌ Lỗi khi lưu ảnh sản phẩm", e);
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
        }

        product.setCreatedDate(LocalDateTime.now());
        product.setUpdatedDate(LocalDateTime.now());

        Product savedProduct = productRepository.save(product);

        // Giá mặc định
        ProductPrice price = new ProductPrice();
        price.setProduct(savedProduct);
        price.setUnitPrice(new java.math.BigDecimal("0.00"));
        price.setCostPrice(new java.math.BigDecimal("0.00"));
        price.setValidFrom(LocalDateTime.now());
        productPriceRepository.save(price);

        // Kho mặc định
        Inventory inventory = new Inventory();
        inventory.setProduct(savedProduct);
        inventory.setQuantityInStock(0);
        inventory.setMinimumStock(0);
        inventory.setMaximumStock(0);
        inventory.setReorderPoint(0);
        inventory.setLastUpdated(LocalDateTime.now());
        inventoryRepository.save(inventory);

        return productMapper.toResponse(savedProduct);
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

        // Xử lý upload ảnh mới nếu có
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + request.getImage().getOriginalFilename();

                Path uploadPath = Paths.get(uploadDir, "products").toAbsolutePath();

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName);
                request.getImage().transferTo(filePath.toFile());

                product.setImageUrl("/uploads/products/" + fileName);

                log.info("✅ Updated image: {}", product.getImageUrl());

            } catch (Exception e) {
                log.error("❌ Lỗi khi lưu ảnh sản phẩm", e);
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
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

                    productPriceRepository.findTopByProduct_ProductIdOrderByValidFromDesc(product.getProductId())
                            .ifPresent(latestPrice -> {
                                response.setUnitPrice(latestPrice.getUnitPrice());
                                response.setCostPrice(latestPrice.getCostPrice());
                            });

                    inventoryRepository.findByProduct_ProductId(product.getProductId())
                            .ifPresent(inventory ->
                                    response.setQuantityInStock(inventory.getQuantityInStock())
                            );

                    return response;
                })
                .toList();
    }


    @Override
    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productPriceRepository.deleteAllByProduct_ProductId(id);
        inventoryRepository.deleteAllByProduct_ProductId(id);
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
                if (productRepository.existsByProductCode(request.getProductCode())) {
                    String error = String.format("Row %d: Product code '%s' already exists",
                            rowNumber, request.getProductCode());
                    log.warn("⚠️ {}", error);
                    errors.add(error);
                    continue;
                }

                Category category = categoryRepository.findByCategoryNameIgnoreCase(request.getCategoryName())
                        .orElseThrow(() -> {
                            String error = String.format("Row %d: Category '%s' not found",
                                    rowNumber, request.getCategoryName());
                            log.error("❌ {}", error);
                            return new RuntimeException(error);
                        });

                Supplier supplier = supplierRepository.findBySupplierNameIgnoreCase(request.getSupplierName())
                        .orElseThrow(() -> {
                            String error = String.format("Row %d: Supplier '%s' not found",
                                    rowNumber, request.getSupplierName());
                            log.error("❌ {}", error);
                            return new RuntimeException(error);
                        });

                Product product = new Product();
                product.setProductCode(request.getProductCode());
                product.setProductName(request.getProductName());
                product.setDescription(request.getDescription());
                product.setCategory(category);
                product.setSupplier(supplier);
                product.setUnit(request.getUnit());
                product.setDimensions(request.getDimensions());
                product.setImageUrl(request.getImageUrl());
                product.setCreatedDate(LocalDateTime.now());
                product.setUpdatedDate(LocalDateTime.now());

                Product savedProduct = productRepository.save(product);

                ProductPrice price = new ProductPrice();
                price.setProduct(savedProduct);
                price.setUnitPrice(new java.math.BigDecimal("0.00"));
                price.setCostPrice(new java.math.BigDecimal("0.00"));

                price.setValidFrom(LocalDateTime.now());
                productPriceRepository.save(price);

                com.g127.snapbuy.entity.Inventory inventory = new com.g127.snapbuy.entity.Inventory();
                inventory.setProduct(savedProduct);
                inventory.setQuantityInStock(0);
                inventory.setMinimumStock(0);
                inventory.setMaximumStock(0);
                inventory.setReorderPoint(0);
                inventory.setLastUpdated(LocalDateTime.now());
                inventoryRepository.save(inventory);

                importedProducts.add(productMapper.toResponse(savedProduct));

                log.info("Row {}: Product '{}' imported successfully", rowNumber, request.getProductCode());

            } catch (Exception e) {
                String error = String.format("Row %d: %s", rowNumber, e.getMessage());
                log.error("{}", error);
                errors.add(error);
            }
        }

        if (!errors.isEmpty()) {
            log.warn("Import completed with {} errors:", errors.size());
            errors.forEach(log::warn);
        }

        log.info("Import summary: {} successful, {} failed out of {} total",
                importedProducts.size(), errors.size(), requests.size());

        return importedProducts;
    }

    @Override
    public List<ProductResponse> getProductsBySupplierId(UUID supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        List<Product> products = productRepository.findBySupplier_SupplierId(supplierId);

        if (products.isEmpty()) {
            log.info("⚠️ Không tìm thấy sản phẩm nào: {}", supplier.getSupplierName());
            return List.of();
        }

        return products.stream().map(product -> {
            ProductResponse response = productMapper.toResponse(product);

            productPriceRepository.findTopByProduct_ProductIdOrderByValidFromDesc(product.getProductId())
                    .ifPresent(latestPrice -> {
                        response.setUnitPrice(latestPrice.getUnitPrice());
                        response.setCostPrice(latestPrice.getCostPrice());
                    });

            inventoryRepository.findByProduct_ProductId(product.getProductId())
                    .ifPresent(inventory -> response.setQuantityInStock(inventory.getQuantityInStock()));

            return response;
        }).toList();
    }


}
