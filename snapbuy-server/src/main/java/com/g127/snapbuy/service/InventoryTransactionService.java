package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.response.InventoryTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.lang.Nullable;

import java.time.LocalDateTime;
import java.util.UUID;

public interface InventoryTransactionService {
    java.util.List<InventoryTransactionResponse> getAll();
    Page<InventoryTransactionResponse> list(
            int page,
            int size,
            String sort,
            Sort.Direction dir,
            @Nullable UUID productId,
            @Nullable String transactionType,
            @Nullable String referenceType,
            @Nullable UUID referenceId,
            @Nullable LocalDateTime from,
            @Nullable LocalDateTime to
    );
}


