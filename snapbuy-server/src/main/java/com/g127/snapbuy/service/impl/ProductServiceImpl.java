package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.ProductCreateRequest;
import com.g127.snapbuy.dto.request.ProductImportRequest;
import com.g127.snapbuy.dto.request.ProductUpdateRequest;
import com.g127.snapbuy.dto.response.PageResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
                // Validate Product Code
                String productCode = request.getProductCode() != null ? request.getProductCode().trim() : "";
                if (productCode.isEmpty()) {
                    String error = String.format("Row %d: Mã sản phẩm không được để trống", rowNumber);
                    errors.add(error);
                    continue;
                }
                if (productCode.length() < 3 || productCode.length() > 10) {
                    String error = String.format("Row %d: Mã sản phẩm phải từ 3 đến 10 ký tự", rowNumber);
                    errors.add(error);
                    continue;
                }
                if (!productCode.matches("^[a-zA-Z0-9_-]+$")) {
                    String error = String.format("Row %d: Mã sản phẩm chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang", rowNumber);
                    errors.add(error);
                    continue;
                }
                if (productRepository.existsByProductCode(productCode)) {
                    String error = String.format("Row %d: Mã sản phẩm '%s' đã tồn tại", rowNumber, productCode);
                    log.warn("⚠️ {}", error);
                    errors.add(error);
                    continue;
                }

                // Validate Product Name
                String productName = request.getProductName() != null ? request.getProductName().trim() : "";
                if (productName.isEmpty()) {
                    String error = String.format("Row %d: Tên sản phẩm không được để trống", rowNumber);
                    errors.add(error);
                    continue;
                }
                if (productName.length() < 3 || productName.length() > 100) {
                    String error = String.format("Row %d: Tên sản phẩm phải từ 3 đến 100 ký tự", rowNumber);
                    errors.add(error);
                    continue;
                }

                // Validate Category Name
                String categoryName = request.getCategoryName() != null ? request.getCategoryName().trim() : "";
                if (categoryName.isEmpty()) {
                    String error = String.format("Row %d: Tên danh mục không được để trống", rowNumber);
                    errors.add(error);
                    continue;
                }

                // Validate Supplier Code
                String supplierCode = request.getSupplierCode() != null ? request.getSupplierCode().trim() : "";
                if (supplierCode.isEmpty()) {
                    String error = String.format("Row %d: Mã nhà cung cấp không được để trống", rowNumber);
                    errors.add(error);
                    continue;
                }
                if (supplierCode.length() < 3 || supplierCode.length() > 10) {
                    String error = String.format("Row %d: Mã nhà cung cấp phải từ 3 đến 10 ký tự", rowNumber);
                    errors.add(error);
                    continue;
                }
                if (!supplierCode.matches("^[a-zA-Z0-9_-]+$")) {
                    String error = String.format("Row %d: Mã nhà cung cấp chỉ được chứa chữ, số, gạch dưới hoặc gạch ngang", rowNumber);
                    errors.add(error);
                    continue;
                }

                // Validate Supplier Name
                String supplierName = request.getSupplierName() != null ? request.getSupplierName().trim() : "";
                if (supplierName.isEmpty()) {
                    String error = String.format("Row %d: Tên nhà cung cấp không được để trống", rowNumber);
                    errors.add(error);
                    continue;
                }
                if (supplierName.length() < 3 || supplierName.length() > 100) {
                    String error = String.format("Row %d: Tên nhà cung cấp phải từ 3 đến 100 ký tự", rowNumber);
                    errors.add(error);
                    continue;
                }

                // Validate Unit
                if (request.getUnit() != null && request.getUnit().trim().length() > 10) {
                    String error = String.format("Row %d: Đơn vị không được quá 10 ký tự", rowNumber);
                    errors.add(error);
                    continue;
                }

                // Validate Dimensions
                if (request.getDimensions() != null && request.getDimensions().trim().length() > 30) {
                    String error = String.format("Row %d: Kích thước không được quá 30 ký tự", rowNumber);
                    errors.add(error);
                    continue;
                }

                // Validate Barcode
                if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
                    String barcode = request.getBarcode().trim();
                    if (barcode.length() > 50) {
                        String error = String.format("Row %d: Barcode không được quá 50 ký tự", rowNumber);
                        errors.add(error);
                        continue;
                    }
                    if (!barcode.matches("^[a-zA-Z0-9]*$")) {
                        String error = String.format("Row %d: Barcode chỉ được chứa chữ và số", rowNumber);
                        errors.add(error);
                        continue;
                    }
                }

                // Tìm hoặc tạo Category
                Category category = categoryRepository.findByCategoryNameIgnoreCase(categoryName)
                        .orElseGet(() -> {
                            log.info("Creating new category: {}", categoryName);
                            Category newCategory = new Category();
                            newCategory.setCategoryName(categoryName);
                            newCategory.setDescription("Tự động tạo từ import");
                            newCategory.setActive(true);
                            newCategory.setCreatedDate(LocalDateTime.now());
                            newCategory.setUpdatedDate(LocalDateTime.now());
                            return categoryRepository.save(newCategory);
                        });

                // Kiểm tra category có con hay không
                List<Category> childCategories = categoryRepository.findByParentCategoryId(category.getCategoryId());
                boolean hasChildren = childCategories != null && !childCategories.isEmpty();
                
                // Nếu category có con, bắt buộc phải dùng category con
                if (hasChildren) {
                    String subCategoryName = request.getSubCategoryName() != null ? request.getSubCategoryName().trim() : "";
                    if (subCategoryName.isEmpty()) {
                        String error = String.format("Row %d: Danh mục '%s' đã có danh mục con. Bắt buộc phải nhập danh mục con, không được dùng danh mục cha", 
                                rowNumber, categoryName);
                        errors.add(error);
                        continue;
                    }
                    
                    // Lưu categoryId vào biến final để sử dụng trong lambda
                    final UUID parentCategoryId = category.getCategoryId();
                    
                    // Tìm hoặc tạo subcategory
                    Category subCategory = categoryRepository.findByCategoryNameIgnoreCase(subCategoryName)
                            .orElseGet(() -> {
                                log.info("Creating new subcategory: {} under category: {}", 
                                        subCategoryName, categoryName);
                                Category newSubCategory = new Category();
                                newSubCategory.setCategoryName(subCategoryName);
                                newSubCategory.setDescription("Tự động tạo từ import");
                                newSubCategory.setParentCategoryId(parentCategoryId);
                                newSubCategory.setActive(true);
                                newSubCategory.setCreatedDate(LocalDateTime.now());
                                newSubCategory.setUpdatedDate(LocalDateTime.now());
                                return categoryRepository.save(newSubCategory);
                            });
                    
                    // Kiểm tra subcategory có phải con của category không
                    if (subCategory.getParentCategoryId() == null || 
                        !subCategory.getParentCategoryId().equals(category.getCategoryId())) {
                        String error = String.format("Row %d: Danh mục con '%s' không thuộc về danh mục '%s'", 
                                rowNumber, subCategoryName, categoryName);
                        errors.add(error);
                        continue;
                    }
                    
                    category = subCategory; // Sử dụng subcategory làm category cho product
                } else {
                    // Nếu category không có con, kiểm tra xem có nhập subCategoryName không
                    // Nếu có thì validate subCategoryName phải thuộc về category này
                    String subCategoryName = request.getSubCategoryName() != null ? request.getSubCategoryName().trim() : "";
                    if (!subCategoryName.isEmpty()) {
                        Category subCategory = categoryRepository.findByCategoryNameIgnoreCase(subCategoryName)
                                .orElse(null);
                        if (subCategory != null) {
                            if (subCategory.getParentCategoryId() == null || 
                                !subCategory.getParentCategoryId().equals(category.getCategoryId())) {
                                String error = String.format("Row %d: Danh mục con '%s' không thuộc về danh mục '%s'", 
                                        rowNumber, subCategoryName, categoryName);
                                errors.add(error);
                                continue;
                            }
                            category = subCategory;
                        } else {
                            // Tạo subcategory mới
                            Category newSubCategory = new Category();
                            newSubCategory.setCategoryName(subCategoryName);
                            newSubCategory.setDescription("Tự động tạo từ import");
                            newSubCategory.setParentCategoryId(category.getCategoryId());
                            newSubCategory.setActive(true);
                            newSubCategory.setCreatedDate(LocalDateTime.now());
                            newSubCategory.setUpdatedDate(LocalDateTime.now());
                            category = categoryRepository.save(newSubCategory);
                        }
                    }
                }

                // Validate và tìm hoặc tạo Supplier
                Supplier supplier = null;
                String trimmedCode = (request.getSupplierCode() != null && !request.getSupplierCode().trim().isEmpty()) 
                        ? request.getSupplierCode().trim() : null;
                String trimmedName = (request.getSupplierName() != null && !request.getSupplierName().trim().isEmpty()) 
                        ? request.getSupplierName().trim() : null;
                
                if (trimmedCode == null || trimmedName == null) {
                    String error = String.format("Row %d: Supplier code and name are required", rowNumber);
                    log.warn("⚠️ {}", error);
                    errors.add(error);
                    continue;
                }
                
                // Kiểm tra mã NCC có tồn tại không
                Supplier supplierByCode = supplierRepository.findBySupplierCodeIgnoreCase(trimmedCode)
                        .orElse(null);
                
                // Kiểm tra tên NCC có tồn tại không
                Supplier supplierByName = supplierRepository.findBySupplierNameIgnoreCase(trimmedName)
                        .orElse(null);
                
                boolean codeExists = supplierByCode != null;
                boolean nameExists = supplierByName != null;
                
                // Logic validation theo yêu cầu:
                // 1. Nếu mã và tên đều mới → tạo mới
                // 2. Nếu mã đã có nhưng tên khác → báo lỗi
                // 3. Nếu mã mới nhưng tên đã có → báo lỗi
                // 4. Nếu mã và tên đều đã có và khớp → sử dụng supplier đó
                
                if (codeExists && nameExists) {
                    // Cả mã và tên đều đã có
                    if (supplierByCode.getSupplierId().equals(supplierByName.getSupplierId())) {
                        // Mã và tên khớp với nhau (cùng một supplier)
                        supplier = supplierByCode;
                        log.info("Found existing supplier: {} ({})", supplier.getSupplierName(), supplier.getSupplierCode());
                    } else {
                        // Mã và tên không khớp (mã thuộc supplier khác, tên thuộc supplier khác)
                        String error = String.format("Row %d: Mã nhà cung cấp '%s' và tên nhà cung cấp '%s' không khớp. " +
                                "Mã này thuộc về nhà cung cấp '%s', còn tên này thuộc về nhà cung cấp có mã '%s'",
                                rowNumber, trimmedCode, trimmedName, 
                                supplierByCode.getSupplierName(), supplierByName.getSupplierCode());
                        log.warn("⚠️ {}", error);
                        errors.add(error);
                        continue;
                    }
                } else if (codeExists && !nameExists) {
                    // Mã đã có nhưng tên mới → báo lỗi
                    String error = String.format("Row %d: Mã nhà cung cấp '%s' đã tồn tại và thuộc về nhà cung cấp '%s', " +
                            "nhưng tên nhà cung cấp '%s' không khớp",
                            rowNumber, trimmedCode, supplierByCode.getSupplierName(), trimmedName);
                    log.warn("⚠️ {}", error);
                    errors.add(error);
                    continue;
                } else if (!codeExists && nameExists) {
                    // Mã mới nhưng tên đã có → báo lỗi
                    String error = String.format("Row %d: Tên nhà cung cấp '%s' đã tồn tại và thuộc về nhà cung cấp có mã '%s', " +
                            "nhưng mã nhà cung cấp '%s' không khớp",
                            rowNumber, trimmedName, supplierByName.getSupplierCode(), trimmedCode);
                    log.warn("⚠️ {}", error);
                    errors.add(error);
                    continue;
                } else {
                    // Cả mã và tên đều mới → tạo mới
                    log.info("Creating new supplier: {} (code: {})", trimmedName, trimmedCode);
                    Supplier newSupplier = new Supplier();
                    newSupplier.setSupplierCode(trimmedCode);
                    newSupplier.setSupplierName(trimmedName);
                    newSupplier.setActive(true);
                    newSupplier.setCreatedDate(LocalDateTime.now());
                    newSupplier.setUpdatedDate(LocalDateTime.now());
                    supplier = supplierRepository.save(newSupplier);
                    log.info("Created new supplier: {} (code: {})", supplier.getSupplierName(), supplier.getSupplierCode());
                }

                Product product = new Product();
                product.setProductCode(productCode);
                product.setProductName(productName);
                product.setDescription(request.getDescription());
                product.setCategory(category);
                product.setSupplier(supplier);
                product.setUnit(request.getUnit() != null ? request.getUnit().trim() : null);
                product.setDimensions(request.getDimensions() != null ? request.getDimensions().trim() : null);
                // Set barcode thay vì imageUrl
                if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
                    String barcode = request.getBarcode().trim();
                    // Kiểm tra barcode có trùng không
                    if (productRepository.existsByBarcode(barcode)) {
                        String error = String.format("Row %d: Barcode '%s' đã tồn tại", rowNumber, barcode);
                        errors.add(error);
                        continue;
                    }
                    product.setBarcode(barcode);
                }
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
    @Transactional
    public PageResponse<ProductResponse> searchByKeyword(String keyword, Pageable pageable) {
        Page<Product> productPage = productRepository.searchByKeyword(keyword, 
            org.springframework.data.domain.PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize()
            ));
        
        List<UUID> productIds = productPage.getContent().stream()
                .map(Product::getProductId)
                .filter(java.util.Objects::nonNull)
                .toList();
        
        List<Product> productsWithRelations = productIds.isEmpty() 
            ? List.of()
            : productRepository.findAllById(productIds);
        
        java.util.Map<UUID, Product> productMap = productsWithRelations.stream()
                .collect(Collectors.toMap(Product::getProductId, p -> p));
        
        List<ProductResponse> responseList = productPage.getContent().stream()
                .map(product -> {
                    Product fullProduct = productMap.get(product.getProductId());
                    if (fullProduct == null) {
                        return null;
                    }
                    
                    ProductResponse response = productMapper.toResponse(fullProduct);
                    
                    productPriceRepository.findTopByProduct_ProductIdOrderByValidFromDesc(fullProduct.getProductId())
                            .ifPresent(latestPrice -> {
                                response.setUnitPrice(latestPrice.getUnitPrice());
                                response.setCostPrice(latestPrice.getCostPrice());
                            });
                    
                    inventoryRepository.findByProduct_ProductId(fullProduct.getProductId())
                            .ifPresent(inventory -> response.setQuantityInStock(inventory.getQuantityInStock()));
                    
                    return response;
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
        
        return PageResponse.<ProductResponse>builder()
                .content(responseList)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .size(productPage.getSize())
                .number(productPage.getNumber())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .empty(productPage.isEmpty())
                .build();
    }

    @Override
    public ProductResponse toggleProductStatus(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        Boolean currentActive = product.getActive();
        log.info("Toggling product {} status from {} to {}", id, currentActive, currentActive == null || !currentActive);
        product.setActive(currentActive == null || !currentActive);
        product.setUpdatedDate(LocalDateTime.now());
        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }

}
