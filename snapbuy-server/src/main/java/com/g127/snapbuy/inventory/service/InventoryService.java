package com.g127.snapbuy.inventory.service;

import com.g127.snapbuy.inventory.dto.request.InventoryCreateRequest;
import com.g127.snapbuy.inventory.dto.request.InventoryUpdateRequest;
import com.g127.snapbuy.inventory.dto.response.InventoryResponse;

import java.util.List;
import java.util.UUID;

public interface InventoryService {
    InventoryResponse createInventory(InventoryCreateRequest request);
    InventoryResponse updateInventory(UUID id, InventoryUpdateRequest request);
    InventoryResponse getInventoryById(UUID id);
    List<InventoryResponse> getAllInventories();
    void deleteInventory(UUID id);
}
