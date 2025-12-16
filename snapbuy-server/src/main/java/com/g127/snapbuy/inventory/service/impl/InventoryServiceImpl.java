package com.g127.snapbuy.inventory.service.impl;

import com.g127.snapbuy.inventory.dto.request.InventoryCreateRequest;
import com.g127.snapbuy.inventory.dto.request.InventoryUpdateRequest;
import com.g127.snapbuy.inventory.dto.response.InventoryResponse;
import com.g127.snapbuy.inventory.entity.Inventory;
import com.g127.snapbuy.inventory.entity.InventoryTransaction;
import com.g127.snapbuy.product.entity.Product;
import com.g127.snapbuy.account.entity.Account;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.inventory.mapper.InventoryMapper;
import com.g127.snapbuy.inventory.repository.InventoryRepository;
import com.g127.snapbuy.inventory.repository.InventoryTransactionRepository;
import com.g127.snapbuy.product.repository.ProductRepository;
import com.g127.snapbuy.inventory.service.InventoryService;
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

        Integer minimumStock = request.getMinimumStock();
        Integer maximumStock = request.getMaximumStock();
        Integer reorderPoint = request.getReorderPoint();

        // Validate: minimumStock < maximumStock
        if (minimumStock != null && maximumStock != null && minimumStock >= maximumStock) {
            throw new IllegalArgumentException("Tồn kho tối đa phải lớn hơn tồn kho tối thiểu.");
        }

        // Validate: reorderPoint > minimumStock
        if (minimumStock != null && reorderPoint != null && reorderPoint <= minimumStock) {
            throw new IllegalArgumentException("Điểm đặt hàng lại phải lớn hơn tồn kho tối thiểu.");
        }

        // Validate: reorderPoint < maximumStock
        if (maximumStock != null && reorderPoint != null && reorderPoint >= maximumStock) {
            throw new IllegalArgumentException("Điểm đặt hàng lại phải nhỏ hơn tồn kho tối đa.");
        }

        Inventory inventory = inventoryMapper.toEntity(request);
        inventory.setProduct(product);
        inventory.setLastUpdated(LocalDateTime.now());

        Inventory saved = inventoryRepository.save(inventory);

        recordTransaction(product, request.getQuantityInStock(), "Nhập kho", null, "Khởi tạo tồn kho ban đầu");

        return inventoryMapper.toResponse(saved);
    }

    @Override
    public InventoryResponse updateInventory(UUID id, InventoryUpdateRequest request) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        Integer minimumStock = request.getMinimumStock() != null 
                ? request.getMinimumStock() 
                : inventory.getMinimumStock();
        Integer maximumStock = request.getMaximumStock() != null 
                ? request.getMaximumStock() 
                : inventory.getMaximumStock();
        Integer reorderPoint = request.getReorderPoint() != null 
                ? request.getReorderPoint() 
                : inventory.getReorderPoint();

        // Validate: minimumStock < maximumStock
        if (minimumStock != null && maximumStock != null && minimumStock >= maximumStock) {
            throw new IllegalArgumentException("Tồn kho tối đa phải lớn hơn tồn kho tối thiểu.");
        }

        // Validate: reorderPoint > minimumStock
        if (minimumStock != null && reorderPoint != null && reorderPoint <= minimumStock) {
            throw new IllegalArgumentException("Điểm đặt hàng lại phải lớn hơn tồn kho tối thiểu.");
        }

        // Validate: reorderPoint < maximumStock
        if (maximumStock != null && reorderPoint != null && reorderPoint >= maximumStock) {
            throw new IllegalArgumentException("Điểm đặt hàng lại phải nhỏ hơn tồn kho tối đa.");
        }

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
                .filter(inventory -> inventory.getProduct() != null && 
                        (inventory.getProduct().getActive() == null || inventory.getProduct().getActive()))
                .map(inventoryMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteInventory(UUID id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));
        inventoryRepository.delete(inventory);

        recordTransaction(inventory.getProduct(), 0, "Xóa tồn", null, "Xóa tồn kho");
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
