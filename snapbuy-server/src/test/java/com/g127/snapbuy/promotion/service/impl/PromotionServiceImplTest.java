package com.g127.snapbuy.promotion.service.impl;

import com.g127.snapbuy.notification.service.NotificationSchedulerService;
import com.g127.snapbuy.promotion.dto.request.PromotionCreateRequest;
import com.g127.snapbuy.promotion.dto.request.PromotionUpdateRequest;
import com.g127.snapbuy.promotion.dto.response.PromotionResponse;
import com.g127.snapbuy.product.entity.Product;
import com.g127.snapbuy.promotion.entity.Promotion;
import com.g127.snapbuy.promotion.entity.Promotion.DiscountType;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.promotion.mapper.PromotionMapper;
import com.g127.snapbuy.product.repository.ProductRepository;
import com.g127.snapbuy.promotion.repository.PromotionRepository;
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
class PromotionServiceImplTest {

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PromotionMapper promotionMapper;

    @Mock
    private NotificationSchedulerService notificationSchedulerService;

    @InjectMocks
    private PromotionServiceImpl promotionService;

    private Promotion testPromotion;
    private Product testProduct;
    private PromotionResponse promotionResponse;
    private UUID promotionId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        promotionId = UUID.randomUUID();
        productId = UUID.randomUUID();

        testProduct = new Product();
        testProduct.setProductId(productId);
        testProduct.setProductCode("PROD001");
        testProduct.setProductName("Test Product");
        testProduct.setActive(true);

        testPromotion = new Promotion();
        testPromotion.setPromotionId(promotionId);
        testPromotion.setPromotionName("Test Promotion");
        testPromotion.setDiscountType(DiscountType.PERCENT);
        testPromotion.setDiscountValue(BigDecimal.valueOf(10));
        testPromotion.setStartDate(LocalDateTime.now());
        testPromotion.setEndDate(LocalDateTime.now().plusDays(7));
        testPromotion.setActive(true);
        testPromotion.setProducts(new HashSet<>(Arrays.asList(testProduct)));

        promotionResponse = PromotionResponse.builder()
                .promotionId(promotionId)
                .promotionName("Test Promotion")
                .discountType(DiscountType.PERCENT)
                .discountValue(BigDecimal.valueOf(10))
                .active(true)
                .build();
    }

    @Test
    void create_Success() {
        // Given
        PromotionCreateRequest request = new PromotionCreateRequest();
        request.setPromotionName("New Promotion");
        request.setDiscountType(DiscountType.PERCENT);
        request.setDiscountValue(BigDecimal.valueOf(15));
        request.setStartDate(LocalDateTime.now());
        request.setEndDate(LocalDateTime.now().plusDays(7));
        request.setProductIds(Arrays.asList(productId));

        when(promotionRepository.existsByPromotionNameIgnoreCase(anyString())).thenReturn(false);
        when(promotionMapper.toEntity(any(PromotionCreateRequest.class))).thenReturn(testPromotion);
        when(productRepository.findById(productId)).thenReturn(Optional.of(testProduct));
        when(promotionRepository.save(any(Promotion.class))).thenReturn(testPromotion);
        when(promotionMapper.toResponse(any(Promotion.class))).thenReturn(promotionResponse);

        // When
        PromotionResponse result = promotionService.create(request);

        // Then
        assertNotNull(result);
        verify(promotionRepository).save(any(Promotion.class));
        verify(notificationSchedulerService).schedulePromotionNotifications(promotionId);
    }

    @Test
    void create_InvalidDateRange_ThrowsException() {
        // Given
        PromotionCreateRequest request = new PromotionCreateRequest();
        request.setPromotionName("New Promotion");
        request.setStartDate(LocalDateTime.now().plusDays(7));
        request.setEndDate(LocalDateTime.now());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> promotionService.create(request));
        assertEquals(ErrorCode.INVALID_DATE_RANGE, exception.getErrorCode());
        verify(promotionRepository, never()).save(any(Promotion.class));
    }

    @Test
    void create_DuplicateName_ThrowsException() {
        // Given
        PromotionCreateRequest request = new PromotionCreateRequest();
        request.setPromotionName("Existing Promotion");
        request.setStartDate(LocalDateTime.now());
        request.setEndDate(LocalDateTime.now().plusDays(7));

        when(promotionRepository.existsByPromotionNameIgnoreCase(anyString())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> promotionService.create(request));
        assertEquals(ErrorCode.NAME_EXISTED, exception.getErrorCode());
        verify(promotionRepository, never()).save(any(Promotion.class));
    }

    @Test
    void update_Success() {
        // Given
        PromotionUpdateRequest request = new PromotionUpdateRequest();
        request.setPromotionName("Updated Promotion");
        request.setDiscountValue(BigDecimal.valueOf(20));
        request.setStartDate(LocalDateTime.now());
        request.setEndDate(LocalDateTime.now().plusDays(14));

        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(testPromotion));
        when(promotionRepository.existsByPromotionNameIgnoreCase(anyString())).thenReturn(false);
        when(promotionRepository.save(any(Promotion.class))).thenReturn(testPromotion);
        when(promotionMapper.toResponse(any(Promotion.class))).thenReturn(promotionResponse);

        // When
        PromotionResponse result = promotionService.update(promotionId, request);

        // Then
        assertNotNull(result);
        verify(promotionMapper).updateEntity(testPromotion, request);
        verify(promotionRepository).save(testPromotion);
        verify(notificationSchedulerService).schedulePromotionNotifications(promotionId);
    }

    @Test
    void update_NotFound_ThrowsException() {
        // Given
        PromotionUpdateRequest request = new PromotionUpdateRequest();
        when(promotionRepository.findById(promotionId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> promotionService.update(promotionId, request));
        assertEquals(ErrorCode.PROMOTION_NOT_FOUND, exception.getErrorCode());
        verify(promotionRepository, never()).save(any(Promotion.class));
    }

    @Test
    void update_InvalidDateRange_ThrowsException() {
        // Given
        PromotionUpdateRequest request = new PromotionUpdateRequest();
        request.setStartDate(LocalDateTime.now().plusDays(7));
        request.setEndDate(LocalDateTime.now());

        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(testPromotion));

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> promotionService.update(promotionId, request));
        assertEquals(ErrorCode.INVALID_DATE_RANGE, exception.getErrorCode());
        verify(promotionRepository, never()).save(any(Promotion.class));
    }

    @Test
    void getById_Success() {
        // Given
        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(testPromotion));
        when(promotionMapper.toResponse(any(Promotion.class))).thenReturn(promotionResponse);

        // When
        PromotionResponse result = promotionService.getById(promotionId);

        // Then
        assertNotNull(result);
        assertEquals(promotionId, result.getPromotionId());
    }

    @Test
    void getById_NotFound_ThrowsException() {
        // Given
        when(promotionRepository.findById(promotionId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> promotionService.getById(promotionId));
        assertEquals(ErrorCode.PROMOTION_NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void getAll_Success() {
        // Given
        List<Promotion> promotions = Arrays.asList(testPromotion);
        when(promotionRepository.findAllWithProducts()).thenReturn(promotions);
        when(promotionMapper.toResponse(any(Promotion.class))).thenReturn(promotionResponse);

        // When
        List<PromotionResponse> result = promotionService.getAll();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void togglePromotionStatus_Success() {
        // Given
        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(testPromotion));
        when(promotionRepository.save(any(Promotion.class))).thenReturn(testPromotion);
        when(promotionMapper.toResponse(any(Promotion.class))).thenReturn(promotionResponse);

        // When
        PromotionResponse result = promotionService.togglePromotionStatus(promotionId);

        // Then
        assertNotNull(result);
        verify(promotionRepository).save(argThat(promo -> !promo.getActive()));
    }

    @Test
    void delete_Success() {
        // Given
        when(promotionRepository.findById(promotionId)).thenReturn(Optional.of(testPromotion));

        // When
        promotionService.delete(promotionId);

        // Then
        verify(promotionRepository).delete(testPromotion);
    }

    @Test
    void delete_NotFound_ThrowsException() {
        // Given
        when(promotionRepository.findById(promotionId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> promotionService.delete(promotionId));
        assertEquals(ErrorCode.PROMOTION_NOT_FOUND, exception.getErrorCode());
        verify(promotionRepository, never()).delete(any(Promotion.class));
    }

    @Test
    void computeBestDiscountPercent_PercentDiscount_Success() {
        // Given
        BigDecimal unitPrice = BigDecimal.valueOf(100000);
        LocalDateTime now = LocalDateTime.now();

        when(promotionRepository.findActivePromotionsForProductAt(productId, now))
            .thenReturn(Arrays.asList(testPromotion));

        // When
        BigDecimal result = promotionService.computeBestDiscountPercent(productId, unitPrice, now);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(10.00).setScale(2), result);
    }

    @Test
    void computeBestDiscountPercent_FixedDiscount_Success() {
        // Given
        testPromotion.setDiscountType(DiscountType.FIXED);
        testPromotion.setDiscountValue(BigDecimal.valueOf(10000));
        BigDecimal unitPrice = BigDecimal.valueOf(100000);
        LocalDateTime now = LocalDateTime.now();

        when(promotionRepository.findActivePromotionsForProductAt(productId, now))
            .thenReturn(Arrays.asList(testPromotion));

        // When
        BigDecimal result = promotionService.computeBestDiscountPercent(productId, unitPrice, now);

        // Then
        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(10.00).setScale(2), result);
    }

    @Test
    void computeBestDiscountPercent_NoPromotions_ReturnsZero() {
        // Given
        BigDecimal unitPrice = BigDecimal.valueOf(100000);
        LocalDateTime now = LocalDateTime.now();

        when(promotionRepository.findActivePromotionsForProductAt(productId, now))
            .thenReturn(Arrays.asList());

        // When
        BigDecimal result = promotionService.computeBestDiscountPercent(productId, unitPrice, now);

        // Then
        assertEquals(BigDecimal.ZERO, result);
    }

    @Test
    void computeBestDiscountPercent_MultiplePromotions_ReturnsBest() {
        // Given
        Promotion promo2 = new Promotion();
        promo2.setPromotionId(UUID.randomUUID());
        promo2.setDiscountType(DiscountType.PERCENT);
        promo2.setDiscountValue(BigDecimal.valueOf(20));

        BigDecimal unitPrice = BigDecimal.valueOf(100000);
        LocalDateTime now = LocalDateTime.now();

        when(promotionRepository.findActivePromotionsForProductAt(productId, now))
            .thenReturn(Arrays.asList(testPromotion, promo2));

        // When
        BigDecimal result = promotionService.computeBestDiscountPercent(productId, unitPrice, now);

        // Then
        assertEquals(BigDecimal.valueOf(20.00).setScale(2), result);
    }

    @Test
    void deactivateExpired_Success() {
        // Given
        List<Promotion> expiredPromotions = Arrays.asList(testPromotion);
        when(promotionRepository.findExpiredActive(any(LocalDateTime.class)))
            .thenReturn(expiredPromotions);

        // When
        promotionService.deactivateExpired();

        // Then
        verify(promotionRepository).saveAll(anyList());
    }
}
