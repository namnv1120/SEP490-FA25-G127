package com.g127.snapbuy.product.service.impl;

import com.g127.snapbuy.product.dto.request.ProductPriceCreateRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceImportRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceUpdateRequest;
import com.g127.snapbuy.product.dto.response.ProductPriceResponse;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.ProductPrice;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.ProductPriceMapper;
import com.g127.snapbuy.repository.ProductPriceRepository;
import com.g127.snapbuy.repository.ProductRepository;
import com.g127.snapbuy.product.service.ProductPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
                .filter(price -> price.getProduct() != null && 
                        (price.getProduct().getActive() == null || price.getProduct().getActive()))
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

    @Override
    @Transactional
    public List<ProductPriceResponse> importPrices(List<ProductPriceImportRequest> requests) {
        List<ProductPriceResponse> importedPrices = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < requests.size(); i++) {
            ProductPriceImportRequest request = requests.get(i);
            int rowNumber = i + 1;

            try {
                String productCode = request.getProductCode() != null ? request.getProductCode().trim() : "";
                if (productCode.isEmpty()) {
                    String error = String.format("Row %d: Mã sản phẩm không được để trống", rowNumber);
                    errors.add(error);
                    continue;
                }

                Product product = productRepository.findAll()
                        .stream()
                        .filter(p -> p.getProductCode() != null &&
                                p.getProductCode().trim().equalsIgnoreCase(productCode))
                        .findFirst()
                        .orElse(null);

                if (product == null) {
                    String error = String.format("Row %d: Không tìm thấy sản phẩm với mã '%s'. Vui lòng kiểm tra lại mã sản phẩm.", rowNumber, productCode);
                    errors.add(error);
                    continue;
                }

                if (request.getUnitPrice() == null) {
                    String error = String.format("Row %d: Giá bán không được để trống", rowNumber);
                    errors.add(error);
                    continue;
                }

                if (request.getUnitPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                    String error = String.format("Row %d: Giá bán phải lớn hơn 0", rowNumber);
                    errors.add(error);
                    continue;
                }

                if (request.getCostPrice() == null) {
                    String error = String.format("Row %d: Giá nhập không được để trống", rowNumber);
                    errors.add(error);
                    continue;
                }

                if (request.getCostPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
                    String error = String.format("Row %d: Giá nhập không được âm", rowNumber);
                    errors.add(error);
                    continue;
                }

                ProductPrice existingPrice = productPriceRepository
                        .findTopByProduct_ProductIdOrderByValidFromDesc(product.getProductId())
                        .orElse(null);

                ProductPrice savedPrice;
                if (existingPrice != null) {
                    if (existingPrice.getValidTo() == null || existingPrice.getValidTo().isAfter(LocalDateTime.now())) {
                        existingPrice.setUnitPrice(request.getUnitPrice());
                        existingPrice.setCostPrice(request.getCostPrice());
                        savedPrice = productPriceRepository.save(existingPrice);
                    } else {
                        ProductPrice newPrice = new ProductPrice();
                        newPrice.setProduct(product);
                        newPrice.setUnitPrice(request.getUnitPrice());
                        newPrice.setCostPrice(request.getCostPrice());
                        newPrice.setValidFrom(LocalDateTime.now());
                        newPrice.setCreatedDate(LocalDateTime.now());
                        savedPrice = productPriceRepository.save(newPrice);
                    }
                } else {
                    ProductPrice newPrice = new ProductPrice();
                    newPrice.setProduct(product);
                    newPrice.setUnitPrice(request.getUnitPrice());
                    newPrice.setCostPrice(request.getCostPrice());
                    newPrice.setValidFrom(LocalDateTime.now());
                    newPrice.setCreatedDate(LocalDateTime.now());
                    savedPrice = productPriceRepository.save(newPrice);
                }

                importedPrices.add(productPriceMapper.toResponse(savedPrice));

            } catch (Exception e) {
                String error = String.format("Row %d: %s", rowNumber, e.getMessage());
                errors.add(error);
            }
        }

        if (!errors.isEmpty()) {
            String errorMessage = String.join("; ", errors);
            throw new RuntimeException("Import thất bại với các lỗi sau: " + errorMessage);
        }

        return importedPrices;
    }
}
