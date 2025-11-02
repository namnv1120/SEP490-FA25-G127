package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.ProductCreateRequest;
import com.g127.snapbuy.dto.request.ProductImportRequest;
import com.g127.snapbuy.dto.request.ProductUpdateRequest;
import com.g127.snapbuy.dto.response.ProductResponse;
import com.g127.snapbuy.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ApiResponse<ProductResponse> createProduct(@ModelAttribute @Valid ProductCreateRequest request) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.createProduct(request));
        return response;
    }


    @PutMapping("{id}")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable("id") UUID id,
            @RequestBody @Valid ProductUpdateRequest request) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.updateProduct(id, request));
        return response;
    }

    @GetMapping
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<List<ProductResponse>> getAllProducts() {
        ApiResponse<List<ProductResponse>> response = new ApiResponse<>();
        response.setResult(productService.getAllProducts());
        return response;
    }

    @GetMapping("{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable("id") UUID id) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.getProductById(id));
        return response;
    }

    @DeleteMapping("{id}")
    public ApiResponse<String> deleteProduct(@PathVariable("id") UUID id) {
        productService.deleteProduct(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Sản phẩm đã được xoá");
        return response;
    }

    @PostMapping("/import")
    public ApiResponse<List<ProductResponse>> importProducts(
            @RequestBody @Valid List<ProductImportRequest> requests) {
        ApiResponse<List<ProductResponse>> response = new ApiResponse<>();
        List<ProductResponse> importedProducts = productService.importProducts(requests);
        response.setResult(importedProducts);

        return response;
    }

    @GetMapping("/supplier/{supplierId}")
    public ApiResponse<List<ProductResponse>> getProductsBySupplierId(@PathVariable("supplierId") UUID supplierId) {
        ApiResponse<List<ProductResponse>> response = new ApiResponse<>();
        response.setResult(productService.getProductsBySupplierId(supplierId));

        return response;
    }

}
