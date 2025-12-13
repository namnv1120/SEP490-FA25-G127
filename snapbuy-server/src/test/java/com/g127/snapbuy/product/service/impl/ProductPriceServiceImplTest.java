package com.g127.snapbuy.product.service.impl;

import com.g127.snapbuy.product.dto.request.ProductPriceCreateRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceImportRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceUpdateRequest;
import com.g127.snapbuy.product.dto.response.ProductPriceResponse;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.ProductPrice;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.mapper.ProductPriceMapper;
import com.g127.snapbuy.repository.ProductPriceRepository;
import com.g127.snapbuy.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductPriceServiceImplTest {

    @Mock
    private ProductPriceRepository productPriceRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductPriceMapper productPriceMapper;

    @InjectMocks
    private ProductPriceServiceImpl productPriceService;

    private Product testProduct;
    private ProductPrice testPrice;
    private ProductPriceResponse priceResponse;
    private UUID productId;
    private UUID priceId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        priceId = UUID.randomUUID();

        testProduct = new Product();
        testProduct.setProductId(productId);
        testProduct.setProductCode("PROD001");
        testProduct.setProductName("Test Product");
        testProduct.setActive(true);

        testPrice = new ProductPrice();
        testPrice.setPriceId(priceId);
        testPrice.setProduct(testProduct);
        testPrice.setUnitPrice(BigDecimal.valueOf(100000));
        testPrice.setCostPrice(BigDecimal.valueOf(80000));
        testPrice.setValidFrom(LocalDateTime.now());
        testPrice.setCreatedDate(LocalDateTime.now());

        priceResponse = ProductPriceResponse.builder()
                .priceId(priceId)
                .productId(productId)
                .unitPrice(BigDecimal.valueOf(100000))
                .costPrice(BigDecimal.valueOf(80000))
                .build();
    }

    @Test
    void createPrice_Success() {
        // Given
        ProductPriceCreateRequest request = new ProductPriceCreateRequest();
        request.setProductId(productId);
        request.setUnitPrice(BigDecimal.valueOf(100000));
        request.setCostPrice(BigDecimal.valueOf(80000));

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productPriceMapper.toEntity(any(ProductPriceCreateRequest.class))).thenReturn(testPrice);
        when(productPriceRepository.save(any(ProductPrice.class))).thenReturn(testPrice);
        when(productPriceMapper.toResponse(any(ProductPrice.class))).thenReturn(priceResponse);

        // When
        ProductPriceResponse result = productPriceService.createPrice(request);

        // Then
        assertNotNull(result);
        assertEquals(priceId, result.getPriceId());
        verify(productPriceRepository).save(any(ProductPrice.class));
    }

    @Test
    void createPrice_ProductNotFound_ThrowsException() {
        // Given
        ProductPriceCreateRequest request = new ProductPriceCreateRequest();
        request.setProductId(productId);

        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> productPriceService.createPrice(request));
        assertEquals(ErrorCode.PRODUCT_NOT_FOUND, exception.getErrorCode());
        verify(productPriceRepository, never()).save(any(ProductPrice.class));
    }

    @Test
    void createPrice_WithNullValidFrom_SetsCurrentTime() {
        // Given
        ProductPriceCreateRequest request = new ProductPriceCreateRequest();
        request.setProductId(productId);
        request.setUnitPrice(BigDecimal.valueOf(100000));
        request.setCostPrice(BigDecimal.valueOf(80000));

        testPrice.setValidFrom(null);

        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(productPriceMapper.toEntity(any(ProductPriceCreateRequest.class))).thenReturn(testPrice);
        when(productPriceRepository.save(any(ProductPrice.class))).thenReturn(testPrice);
        when(productPriceMapper.toResponse(any(ProductPrice.class))).thenReturn(priceResponse);

        // When
        ProductPriceResponse result = productPriceService.createPrice(request);

        // Then
        assertNotNull(result);
        verify(productPriceRepository).save(argThat(price -> price.getValidFrom() != null));
    }

    @Test
    void updatePrice_Success() {
        // Given
        ProductPriceUpdateRequest request = new ProductPriceUpdateRequest();
        request.setUnitPrice(BigDecimal.valueOf(120000));
        request.setCostPrice(BigDecimal.valueOf(90000));

        when(productPriceRepository.findById(priceId)).thenReturn(Optional.of(testPrice));
        when(productPriceRepository.save(any(ProductPrice.class))).thenReturn(testPrice);
        when(productPriceMapper.toResponse(any(ProductPrice.class))).thenReturn(priceResponse);

        // When
        ProductPriceResponse result = productPriceService.updatePrice(priceId, request);

        // Then
        assertNotNull(result);
        verify(productPriceMapper).updateEntity(testPrice, request);
        verify(productPriceRepository).save(testPrice);
    }

    @Test
    void updatePrice_NotFound_ThrowsException() {
        // Given
        ProductPriceUpdateRequest request = new ProductPriceUpdateRequest();
        when(productPriceRepository.findById(priceId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> productPriceService.updatePrice(priceId, request));
        assertEquals(ErrorCode.PRICE_NOT_FOUND, exception.getErrorCode());
        verify(productPriceRepository, never()).save(any(ProductPrice.class));
    }

    @Test
    void getPriceById_Success() {
        // Given
        when(productPriceRepository.findById(priceId)).thenReturn(Optional.of(testPrice));
        when(productPriceMapper.toResponse(any(ProductPrice.class))).thenReturn(priceResponse);

        // When
        ProductPriceResponse result = productPriceService.getPriceById(priceId);

        // Then
        assertNotNull(result);
        assertEquals(priceId, result.getPriceId());
    }

    @Test
    void getPriceById_NotFound_ThrowsException() {
        // Given
        when(productPriceRepository.findById(priceId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> productPriceService.getPriceById(priceId));
        assertEquals(ErrorCode.PRICE_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getAllPrices_Success() {
        // Given
        List<ProductPrice> prices = Arrays.asList(testPrice);
        when(productPriceRepository.findAll()).thenReturn(prices);
        when(productPriceMapper.toResponse(any(ProductPrice.class))).thenReturn(priceResponse);

        // When
        List<ProductPriceResponse> result = productPriceService.getAllPrices();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAllPrices_FilterInactiveProducts() {
        // Given
        Product inactiveProduct = new Product();
        inactiveProduct.setProductId(UUID.randomUUID());
        inactiveProduct.setActive(false);

        ProductPrice inactivePrice = new ProductPrice();
        inactivePrice.setPriceId(UUID.randomUUID());
        inactivePrice.setProduct(inactiveProduct);

        List<ProductPrice> prices = Arrays.asList(testPrice, inactivePrice);
        when(productPriceRepository.findAll()).thenReturn(prices);
        when(productPriceMapper.toResponse(testPrice)).thenReturn(priceResponse);

        // When
        List<ProductPriceResponse> result = productPriceService.getAllPrices();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void deletePrice_Success() {
        // Given
        when(productPriceRepository.existsById(priceId)).thenReturn(true);

        // When
        productPriceService.deletePrice(priceId);

        // Then
        verify(productPriceRepository).deleteById(priceId);
    }

    @Test
    void deletePrice_NotFound_ThrowsException() {
        // Given
        when(productPriceRepository.existsById(priceId)).thenReturn(false);

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> productPriceService.deletePrice(priceId));
        assertEquals(ErrorCode.PRICE_NOT_FOUND, exception.getErrorCode());
        verify(productPriceRepository, never()).deleteById(any());
    }

    @Test
    void importPrices_Success() {
        // Given
        ProductPriceImportRequest importRequest = new ProductPriceImportRequest();
        importRequest.setProductCode("PROD001");
        importRequest.setUnitPrice(BigDecimal.valueOf(100000));
        importRequest.setCostPrice(BigDecimal.valueOf(80000));

        List<ProductPriceImportRequest> requests = Arrays.asList(importRequest);

        when(productRepository.findAll()).thenReturn(Arrays.asList(testProduct));
        when(productPriceRepository.findTopByProduct_ProductIdOrderByValidFromDesc(productId))
            .thenReturn(Optional.empty());
        when(productPriceRepository.save(any(ProductPrice.class))).thenReturn(testPrice);
        when(productPriceMapper.toResponse(any(ProductPrice.class))).thenReturn(priceResponse);

        // When
        List<ProductPriceResponse> result = productPriceService.importPrices(requests);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productPriceRepository).save(any(ProductPrice.class));
    }

    @Test
    void importPrices_EmptyProductCode_ThrowsException() {
        // Given
        ProductPriceImportRequest importRequest = new ProductPriceImportRequest();
        importRequest.setProductCode("");
        importRequest.setUnitPrice(BigDecimal.valueOf(100000));
        importRequest.setCostPrice(BigDecimal.valueOf(80000));

        List<ProductPriceImportRequest> requests = Arrays.asList(importRequest);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> productPriceService.importPrices(requests));
        assertTrue(exception.getMessage().contains("Mã sản phẩm không được để trống"));
    }

    @Test
    void importPrices_ProductNotFound_ThrowsException() {
        // Given
        ProductPriceImportRequest importRequest = new ProductPriceImportRequest();
        importRequest.setProductCode("NOTFOUND");
        importRequest.setUnitPrice(BigDecimal.valueOf(100000));
        importRequest.setCostPrice(BigDecimal.valueOf(80000));

        List<ProductPriceImportRequest> requests = Arrays.asList(importRequest);

        when(productRepository.findAll()).thenReturn(Arrays.asList(testProduct));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> productPriceService.importPrices(requests));
        assertTrue(exception.getMessage().contains("Không tìm thấy sản phẩm"));
    }

    @Test
    void importPrices_NullUnitPrice_ThrowsException() {
        // Given
        ProductPriceImportRequest importRequest = new ProductPriceImportRequest();
        importRequest.setProductCode("PROD001");
        importRequest.setUnitPrice(null);
        importRequest.setCostPrice(BigDecimal.valueOf(80000));

        List<ProductPriceImportRequest> requests = Arrays.asList(importRequest);

        when(productRepository.findAll()).thenReturn(Arrays.asList(testProduct));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> productPriceService.importPrices(requests));
        assertTrue(exception.getMessage().contains("Giá bán không được để trống"));
    }

    @Test
    void importPrices_NegativeUnitPrice_ThrowsException() {
        // Given
        ProductPriceImportRequest importRequest = new ProductPriceImportRequest();
        importRequest.setProductCode("PROD001");
        importRequest.setUnitPrice(BigDecimal.valueOf(-100));
        importRequest.setCostPrice(BigDecimal.valueOf(80000));

        List<ProductPriceImportRequest> requests = Arrays.asList(importRequest);

        when(productRepository.findAll()).thenReturn(Arrays.asList(testProduct));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> productPriceService.importPrices(requests));
        assertTrue(exception.getMessage().contains("Giá bán phải lớn hơn 0"));
    }

    @Test
    void importPrices_UpdateExistingPrice_Success() {
        // Given
        ProductPriceImportRequest importRequest = new ProductPriceImportRequest();
        importRequest.setProductCode("PROD001");
        importRequest.setUnitPrice(BigDecimal.valueOf(120000));
        importRequest.setCostPrice(BigDecimal.valueOf(90000));

        List<ProductPriceImportRequest> requests = Arrays.asList(importRequest);

        when(productRepository.findAll()).thenReturn(Arrays.asList(testProduct));
        when(productPriceRepository.findTopByProduct_ProductIdOrderByValidFromDesc(productId))
            .thenReturn(Optional.of(testPrice));
        when(productPriceRepository.save(any(ProductPrice.class))).thenReturn(testPrice);
        when(productPriceMapper.toResponse(any(ProductPrice.class))).thenReturn(priceResponse);

        // When
        List<ProductPriceResponse> result = productPriceService.importPrices(requests);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(productPriceRepository).save(testPrice);
    }
}
