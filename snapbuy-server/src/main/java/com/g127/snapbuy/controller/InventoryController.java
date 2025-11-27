package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.InventoryCreateRequest;
import com.g127.snapbuy.dto.request.InventoryUpdateRequest;
import com.g127.snapbuy.dto.response.InventoryResponse;
import com.g127.snapbuy.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<InventoryResponse> createInventory(
            @RequestBody @Valid InventoryCreateRequest request) {
        ApiResponse<InventoryResponse> response = new ApiResponse<>();
        response.setResult(inventoryService.createInventory(request));
        return response;
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<InventoryResponse> updateInventory(
            @PathVariable("id") UUID id,
            @RequestBody @Valid InventoryUpdateRequest request) {
        ApiResponse<InventoryResponse> response = new ApiResponse<>();
        response.setResult(inventoryService.updateInventory(id, request));
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<List<InventoryResponse>> getAllInventories() {
        ApiResponse<List<InventoryResponse>> response = new ApiResponse<>();
        response.setResult(inventoryService.getAllInventories());
        return response;
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<InventoryResponse> getInventoryById(@PathVariable("id") UUID id) {
        ApiResponse<InventoryResponse> response = new ApiResponse<>();
        response.setResult(inventoryService.getInventoryById(id));
        return response;
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> deleteInventory(@PathVariable("id") UUID id) {
        inventoryService.deleteInventory(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Hàng tồn kho đã được xoá");
        return response;
    }
}
