package com.g127.snapbuy.product.controller;

import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.product.dto.request.ProductPriceCreateRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceImportRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceUpdateRequest;
import com.g127.snapbuy.product.dto.response.ProductPriceResponse;
import com.g127.snapbuy.product.service.ProductPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product-prices")
@RequiredArgsConstructor
public class ProductPriceController {

    private final ProductPriceService productPriceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<ProductPriceResponse> createPrice(
            @RequestBody @Valid ProductPriceCreateRequest request) {
        ApiResponse<ProductPriceResponse> response = new ApiResponse<>();
        response.setResult(productPriceService.createPrice(request));
        return response;
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<ProductPriceResponse> updatePrice(
            @PathVariable("id") UUID id,
            @RequestBody @Valid ProductPriceUpdateRequest request) {
        ApiResponse<ProductPriceResponse> response = new ApiResponse<>();
        response.setResult(productPriceService.updatePrice(id, request));
        return response;
    }

    @GetMapping
    public ApiResponse<List<ProductPriceResponse>> getAllPrices() {
        ApiResponse<List<ProductPriceResponse>> response = new ApiResponse<>();
        response.setResult(productPriceService.getAllPrices());
        return response;
    }

    @GetMapping("{id}")
    public ApiResponse<ProductPriceResponse> getPriceById(@PathVariable("id") UUID id) {
        ApiResponse<ProductPriceResponse> response = new ApiResponse<>();
        response.setResult(productPriceService.getPriceById(id));
        return response;
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<String> deletePrice(@PathVariable("id") UUID id) {
        productPriceService.deletePrice(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Giá sản phẩm đã được xoá");
        return response;
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<List<ProductPriceResponse>> importPrices(
            @RequestBody @Valid List<ProductPriceImportRequest> requests) {
        ApiResponse<List<ProductPriceResponse>> response = new ApiResponse<>();
        response.setResult(productPriceService.importPrices(requests));
        return response;
    }
}
