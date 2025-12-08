package com.g127.snapbuy.product.service;

import com.g127.snapbuy.product.dto.request.ProductPriceCreateRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceImportRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceUpdateRequest;
import com.g127.snapbuy.product.dto.response.ProductPriceResponse;

import java.util.List;
import java.util.UUID;

public interface ProductPriceService {
    ProductPriceResponse createPrice(ProductPriceCreateRequest request);

    ProductPriceResponse updatePrice(UUID id, ProductPriceUpdateRequest request);

    ProductPriceResponse getPriceById(UUID id);

    List<ProductPriceResponse> getAllPrices();

    void deletePrice(UUID id);

    List<ProductPriceResponse> importPrices(List<ProductPriceImportRequest> requests);
}
