package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.ProductCreateRequest;
import com.g127.snapbuy.dto.request.ProductImportRequest;
import com.g127.snapbuy.dto.request.ProductUpdateRequest;
import com.g127.snapbuy.dto.response.PageResponse;
import com.g127.snapbuy.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductResponse createProduct(ProductCreateRequest request);

    ProductResponse updateProduct(UUID id, ProductUpdateRequest request);

    ProductResponse getProductById(UUID id);

    ProductResponse getProductByBarcode(String barcode);

    List<ProductResponse> getAllProducts();

    void deleteProduct(UUID id);

    List<ProductResponse> importProducts(List<ProductImportRequest> request);

    List<ProductResponse> getProductsBySupplierId(UUID supplierId);

    ProductResponse toggleProductStatus(UUID id);

    PageResponse<ProductResponse> searchByKeyword(String keyword, Pageable pageable);
    PageResponse<ProductResponse> searchProductsPaged(String keyword, Boolean active, UUID categoryId, UUID subCategoryId, Pageable pageable);
}
