package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.ProductCreateRequest;
import com.g127.snapbuy.dto.request.ProductImportRequest;
import com.g127.snapbuy.dto.request.ProductUpdateRequest;
import com.g127.snapbuy.dto.response.ProductResponse;
import com.g127.snapbuy.service.BarcodeService;
import com.g127.snapbuy.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final BarcodeService barcodeService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ApiResponse<ProductResponse> createProduct(@ModelAttribute @Valid ProductCreateRequest request) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.createProduct(request));
        return response;
    }


    @PutMapping(value = "{id}", consumes = {"multipart/form-data"})
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable("id") UUID id,
            @ModelAttribute @Valid ProductUpdateRequest request) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.updateProduct(id, request));
        return response;
    }

    @GetMapping
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

    @GetMapping("/barcode/{barcode}")
    public ApiResponse<ProductResponse> getProductByBarcode(@PathVariable("barcode") String barcode) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.getProductByBarcode(barcode));
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

    @PatchMapping("{id}/toggle-status")
    public ApiResponse<ProductResponse> toggleProductStatus(@PathVariable("id") UUID id) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.toggleProductStatus(id));
        return response;
    }

    @GetMapping("/barcode-image/{barcode}")
    public ResponseEntity<byte[]> getBarcodeImage(
            @PathVariable("barcode") String barcode,
            @RequestParam(defaultValue = "300") int width,
            @RequestParam(defaultValue = "100") int height) {
        try {
            byte[] imageBytes = barcodeService.generateBarcodeImage(barcode, width, height);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(imageBytes.length);
            
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error generating barcode image: {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
