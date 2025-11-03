package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.PromotionCreateRequest;
import com.g127.snapbuy.dto.request.PromotionUpdateRequest;
import com.g127.snapbuy.dto.response.PromotionResponse;
import com.g127.snapbuy.service.PromotionService;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PromotionResponse> create(@Valid @RequestBody PromotionCreateRequest request) {
        ApiResponse<PromotionResponse> response = new ApiResponse<>();
        response.setResult(promotionService.create(request));
        response.setMessage("Tạo khuyến mãi thành công");
        return response;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PromotionResponse> update(@PathVariable UUID id,
                                                 @Valid @RequestBody PromotionUpdateRequest request) {
        ApiResponse<PromotionResponse> response = new ApiResponse<>();
        response.setResult(promotionService.update(id, request));
        response.setMessage("Cập nhật khuyến mãi thành công");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<PromotionResponse>> getAll() {
        ApiResponse<List<PromotionResponse>> response = new ApiResponse<>();
        response.setResult(promotionService.getAll());
        return response;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PromotionResponse> getById(@PathVariable UUID id) {
        ApiResponse<PromotionResponse> response = new ApiResponse<>();
        response.setResult(promotionService.getById(id));
        return response;
    }
}


