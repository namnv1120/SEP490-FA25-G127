package com.g127.snapbuy.inventory.service;

import com.g127.snapbuy.inventory.dto.response.InventoryTransactionResponse;
import com.g127.snapbuy.response.PageResponse;
import org.springframework.data.domain.Sort;
import org.springframework.lang.Nullable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface InventoryTransactionService {
    java.util.List<InventoryTransactionResponse> getAll();
    PageResponse<InventoryTransactionResponse> list(
            int page,
            int size,
            String sort,
            Sort.Direction dir,
            @Nullable UUID productId,
            @Nullable String productName,
            @Nullable String transactionType,
            @Nullable String referenceType,
            @Nullable UUID referenceId,
            @Nullable LocalDateTime from,
            @Nullable LocalDateTime to
    );
}


