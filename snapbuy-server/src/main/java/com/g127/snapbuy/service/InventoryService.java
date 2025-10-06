package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.InventoryCreateRequest;
import com.g127.snapbuy.dto.request.InventoryUpdateRequest;
import com.g127.snapbuy.dto.response.InventoryResponse;

import java.util.List;
import java.util.UUID;

public interface InventoryService {
    InventoryResponse createInventory(InventoryCreateRequest request);
    InventoryResponse updateInventory(UUID id, InventoryUpdateRequest request);
    InventoryResponse getInventoryById(UUID id);
    List<InventoryResponse> getAllInventories();
    void deleteInventory(UUID id);
}
