package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.ProductPriceCreateRequest;
import com.g127.snapbuy.dto.request.ProductPriceUpdateRequest;
import com.g127.snapbuy.dto.response.ProductPriceResponse;
import com.g127.snapbuy.service.ProductPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product-prices")
@RequiredArgsConstructor
public class ProductPriceController {

    private final ProductPriceService productPriceService;

    @PostMapping
    public ApiResponse<ProductPriceResponse> createPrice(
            @RequestBody @Valid ProductPriceCreateRequest request) {
        ApiResponse<ProductPriceResponse> response = new ApiResponse<>();
        response.setResult(productPriceService.createPrice(request));
        return response;
    }

    @PutMapping("{id}")
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
    public ApiResponse<String> deletePrice(@PathVariable("id") UUID id) {
        productPriceService.deletePrice(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Product price deleted");
        return response;
    }
}
