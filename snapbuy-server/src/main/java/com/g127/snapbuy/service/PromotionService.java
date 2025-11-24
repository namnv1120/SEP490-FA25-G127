package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.PromotionCreateRequest;
import com.g127.snapbuy.dto.request.PromotionUpdateRequest;
import com.g127.snapbuy.dto.response.DiscountInfoResponse;
import com.g127.snapbuy.dto.response.PromotionResponse;

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

    BigDecimal computeBestDiscountPercent(UUID productId, BigDecimal unitPrice, LocalDateTime at);
    DiscountInfoResponse computeBestDiscountInfo(UUID productId, BigDecimal unitPrice, LocalDateTime at);
}






