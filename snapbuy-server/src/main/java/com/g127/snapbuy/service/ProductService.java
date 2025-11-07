package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.ProductCreateRequest;
import com.g127.snapbuy.dto.request.ProductImportRequest;
import com.g127.snapbuy.dto.request.ProductUpdateRequest;
import com.g127.snapbuy.dto.response.ProductResponse;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    ProductResponse createProduct(ProductCreateRequest request);

    ProductResponse updateProduct(UUID id, ProductUpdateRequest request);

    ProductResponse getProductById(UUID id);

    List<ProductResponse> getAllProducts();

    void deleteProduct(UUID id);

    List<ProductResponse> importProducts(List<ProductImportRequest> request);

    List<ProductResponse> getProductsBySupplierId(UUID supplierId);

    ProductResponse toggleProductStatus(UUID id);
}
