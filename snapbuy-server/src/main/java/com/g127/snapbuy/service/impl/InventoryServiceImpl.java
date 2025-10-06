package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.InventoryCreateRequest;
import com.g127.snapbuy.dto.request.InventoryUpdateRequest;
import com.g127.snapbuy.dto.response.InventoryResponse;
import com.g127.snapbuy.entity.Inventory;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.InventoryMapper;
import com.g127.snapbuy.repository.InventoryRepository;
import com.g127.snapbuy.repository.ProductRepository;
import com.g127.snapbuy.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public InventoryResponse createInventory(InventoryCreateRequest request) {
        Inventory inventory = inventoryMapper.toEntity(request);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        inventory.setProduct(product);
        inventory.setLastUpdated(LocalDateTime.now());

        return inventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryResponse updateInventory(UUID id, InventoryUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        inventoryMapper.updateEntity(request, inventory);
        inventory.setLastUpdated(LocalDateTime.now());

        return inventoryMapper.toResponse(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryResponse getInventoryById(UUID id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));
        return inventoryMapper.toResponse(inventory);
    }

    @Override
    public List<InventoryResponse> getAllInventories() {
        return inventoryRepository.findAll()
                .stream()
                .map(inventoryMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteInventory(UUID id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));
        inventoryRepository.delete(inventory);
    }
}
