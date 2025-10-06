package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.ProductCreateRequest;
import com.g127.snapbuy.dto.request.ProductUpdateRequest;
import com.g127.snapbuy.dto.response.ProductResponse;
import com.g127.snapbuy.entity.Category;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.Supplier;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.ProductMapper;
import com.g127.snapbuy.repository.CategoryRepository;
import com.g127.snapbuy.repository.ProductRepository;
import com.g127.snapbuy.repository.SupplierRepository;
import com.g127.snapbuy.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
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
        return productMapper.toResponse(product);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        productRepository.delete(product);
    }

}
