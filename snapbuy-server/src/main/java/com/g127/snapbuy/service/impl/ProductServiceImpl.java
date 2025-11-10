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

        // Validate barcode uniqueness nếu có
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            String barcode = request.getBarcode().trim();
            if (productRepository.existsByBarcode(barcode)) {
                throw new AppException(ErrorCode.BARCODE_ALREADY_EXISTS);
            }
            product.setBarcode(barcode);
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

        Product savedProduct;
        try {
            savedProduct = productRepository.save(product);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Nếu có lỗi constraint violation, kiểm tra xem có phải lỗi barcode không
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("UX_products_barcode")) {
                throw new AppException(ErrorCode.BARCODE_ALREADY_EXISTS);
            }
            // Re-throw để GlobalExceptionHandler xử lý
            throw e;
        }

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

        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            String newBarcode = request.getBarcode().trim();
            String currentBarcode = product.getBarcode();
            // Chỉ check unique nếu barcode thay đổi (so sánh cả null case)
            if (currentBarcode == null || !newBarcode.equals(currentBarcode)) {
                if (productRepository.existsByBarcode(newBarcode)) {
                    throw new AppException(ErrorCode.BARCODE_ALREADY_EXISTS);
                }
            }
            product.setBarcode(newBarcode);
        } else {
            product.setBarcode(null);
        }

        // Xử lý xóa ảnh nếu người dùng yêu cầu
        if (request.getRemoveImage() != null && request.getRemoveImage()) {
            product.setImageUrl(null);
            log.info("✅ Removed image for product: {}", product.getProductId());
        }
        // Xử lý upload ảnh mới nếu có
        else if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + request.getImage().getOriginalFilename();

                Path uploadPath = Paths.get(uploadDir, "products").toAbsolutePath();

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName);
                request.getImage().transferTo(filePath.toFile());

                product.setImageUrl("/uploads/products/" + fileName);

            } catch (Exception e) {
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
        }

        product.setUpdatedDate(LocalDateTime.now());

        try {
            return productMapper.toResponse(productRepository.save(product));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Nếu có lỗi constraint violation, kiểm tra xem có phải lỗi barcode không
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("UX_products_barcode")) {
                throw new AppException(ErrorCode.BARCODE_ALREADY_EXISTS);
            }
            // Re-throw để GlobalExceptionHandler xử lý
            throw e;
        }
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
    @Transactional
    public ProductResponse getProductByBarcode(String barcode) {
        if (barcode == null || barcode.trim().isEmpty()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }

        Product product = productRepository.findByBarcodeWithCategory(barcode.trim())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getActive() == null || !product.getActive()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }

        if (product.getCategory() == null
                || product.getCategory().getActive() == null 
                || !product.getCategory().getActive()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }

        ProductResponse response = productMapper.toResponse(product);

        ProductPrice latestPrice = productPriceRepository
                .findTopByProduct_ProductIdOrderByValidFromDesc(product.getProductId())
                .orElse(null);

        if (latestPrice != null) {
            response.setUnitPrice(latestPrice.getUnitPrice());
            response.setCostPrice(latestPrice.getCostPrice());
        }

        inventoryRepository.findByProduct_ProductId(product.getProductId())
                .ifPresent(inventory ->
                        response.setQuantityInStock(inventory.getQuantityInStock())
                );

        return response;
    }

    @Override
    @Transactional
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllActiveWithActiveCategory()
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
                            return new RuntimeException(error);
                        });

                Supplier supplier = supplierRepository.findBySupplierNameIgnoreCase(request.getSupplierName())
                        .orElseThrow(() -> {
                            String error = String.format("Row %d: Supplier '%s' not found",
                                    rowNumber, request.getSupplierName());
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
    @Transactional
    public List<ProductResponse> getProductsBySupplierId(UUID supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));

        List<Product> products = productRepository.findBySupplier_SupplierId(supplierId);

        if (products.isEmpty()) {
            log.info("⚠️ Không tìm thấy sản phẩm nào: {}", supplier.getSupplierName());
            return List.of();
        }

        return products.stream()
                .filter(product -> {
                    // Chỉ trả về sản phẩm có category active
                    boolean productActive = product.getActive() != null && product.getActive();
                    // Category sẽ được load khi access (cần đảm bảo session còn mở với @Transactional)
                    boolean categoryActive = product.getCategory() != null 
                            && product.getCategory().getActive() != null 
                            && product.getCategory().getActive();
                    return productActive && categoryActive;
                })
                .map(product -> {
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

    @Override
    public ProductResponse toggleProductStatus(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        Boolean currentActive = product.getActive();
        log.info("Toggling product {} status from {} to {}", id, currentActive, currentActive == null || !currentActive);
        // Nếu active là null, mặc định là false, toggle thành true
        product.setActive(currentActive == null || !currentActive);
        product.setUpdatedDate(LocalDateTime.now());
        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }

}
