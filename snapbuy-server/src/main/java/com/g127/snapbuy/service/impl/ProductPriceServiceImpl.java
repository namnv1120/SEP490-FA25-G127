package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.ProductPriceCreateRequest;
import com.g127.snapbuy.dto.request.ProductPriceUpdateRequest;
import com.g127.snapbuy.dto.response.ProductPriceResponse;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.ProductPrice;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.ProductPriceMapper;
import com.g127.snapbuy.repository.ProductPriceRepository;
import com.g127.snapbuy.repository.ProductRepository;
import com.g127.snapbuy.service.ProductPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductPriceServiceImpl implements ProductPriceService {

    private final ProductPriceRepository productPriceRepository;
    private final ProductRepository productRepository;
    private final ProductPriceMapper productPriceMapper;

    @Override
    public ProductPriceResponse createPrice(ProductPriceCreateRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        ProductPrice price = productPriceMapper.toEntity(request);
        price.setProduct(product);
        price.setCreatedDate(LocalDateTime.now());
        if (price.getValidFrom() == null) {
            price.setValidFrom(LocalDateTime.now());
        }
        return productPriceMapper.toResponse(productPriceRepository.save(price));
    }

    @Override
    public ProductPriceResponse updatePrice(UUID id, ProductPriceUpdateRequest request) {
        ProductPrice price = productPriceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRICE_NOT_FOUND));

        productPriceMapper.updateEntity(price, request);
        return productPriceMapper.toResponse(productPriceRepository.save(price));
    }

    @Override
    public ProductPriceResponse getPriceById(UUID id) {
        ProductPrice price = productPriceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRICE_NOT_FOUND));
        return productPriceMapper.toResponse(price);
    }

    @Override
    public List<ProductPriceResponse> getAllPrices() {
        return productPriceRepository.findAll()
                .stream()
                .map(productPriceMapper::toResponse)
                .toList();
    }

    @Override
    public void deletePrice(UUID id) {
        if (!productPriceRepository.existsById(id)) {
            throw new AppException(ErrorCode.PRICE_NOT_FOUND);
        }
        productPriceRepository.deleteById(id);
    }
}
