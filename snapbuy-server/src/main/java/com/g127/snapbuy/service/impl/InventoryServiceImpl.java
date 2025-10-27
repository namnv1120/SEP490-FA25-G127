package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.InventoryCreateRequest;
import com.g127.snapbuy.dto.request.InventoryUpdateRequest;
import com.g127.snapbuy.dto.response.InventoryResponse;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.InventoryMapper;
import com.g127.snapbuy.repository.*;
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
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final AccountRepository accountRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    public InventoryResponse createInventory(InventoryCreateRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (inventoryRepository.findByProduct(product).isPresent()) {
            throw new AppException(ErrorCode.CODE_EXISTED);
        }

        if (request.getQuantityInStock() < 0) {
            throw new AppException(ErrorCode.INVALID_STOCK_OPERATION);
        }

        Inventory inventory = inventoryMapper.toEntity(request);
        inventory.setProduct(product);
        inventory.setLastUpdated(LocalDateTime.now());

        Inventory saved = inventoryRepository.save(inventory);

        recordTransaction(product, request.getQuantityInStock(), "IMPORT", null, "Initial stock setup");

        return inventoryMapper.toResponse(saved);
    }

    @Override
    public InventoryResponse updateInventory(UUID id, InventoryUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        // chỉ cập nhật 3 giá trị
        if (request.getMinimumStock() != null) {
            inventory.setMinimumStock(request.getMinimumStock());
        }
        if (request.getMaximumStock() != null) {
            inventory.setMaximumStock(request.getMaximumStock());
        }
        if (request.getReorderPoint() != null) {
            inventory.setReorderPoint(request.getReorderPoint());
        }

        inventory.setLastUpdated(LocalDateTime.now());
        Inventory saved = inventoryRepository.save(inventory);

        return inventoryMapper.toResponse(saved);
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

        recordTransaction(inventory.getProduct(), 0, "DELETE", null, "Inventory deleted");
    }

    private void recordTransaction(Product product, int quantity, String type, Account account, String notes) {
        InventoryTransaction trx = new InventoryTransaction();
        trx.setTransactionId(UUID.randomUUID());
        trx.setProduct(product);
        trx.setAccount(account);
        trx.setTransactionType(type);
        trx.setQuantity(quantity);
        trx.setTransactionDate(LocalDateTime.now());
        trx.setNotes(notes);
        inventoryTransactionRepository.save(trx);
    }
}
