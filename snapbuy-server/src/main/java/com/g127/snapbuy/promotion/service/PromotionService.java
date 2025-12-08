package com.g127.snapbuy.promotion.service;

import com.g127.snapbuy.promotion.dto.request.PromotionCreateRequest;
import com.g127.snapbuy.promotion.dto.request.PromotionUpdateRequest;
import com.g127.snapbuy.order.dto.response.DiscountInfoResponse;
import com.g127.snapbuy.promotion.dto.response.PromotionResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PromotionService {
    PromotionResponse create(PromotionCreateRequest request);
    PromotionResponse update(UUID id, PromotionUpdateRequest request);
    PromotionResponse getById(UUID id);
    List<PromotionResponse> getAll();
    void deactivateExpired();
    PromotionResponse togglePromotionStatus(UUID id);
    void delete(UUID id);

    BigDecimal computeBestDiscountPercent(UUID productId, BigDecimal unitPrice, LocalDateTime at);
    DiscountInfoResponse computeBestDiscountInfo(UUID productId, BigDecimal unitPrice, LocalDateTime at);
}






