package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.InventoryTransactionResponse;
import com.g127.snapbuy.dto.response.PageResponse;
import com.g127.snapbuy.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;


@RestController
@RequestMapping("/api/inventory-transactions")
@RequiredArgsConstructor
@Slf4j
public class InventoryTransactionController {

    private final InventoryTransactionService transactionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên kho')")
    public ApiResponse<PageResponse<InventoryTransactionResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sort,
            @RequestParam(defaultValue = "DESC") String dir,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) String productName,
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) String referenceType,
            @RequestParam(required = false) UUID referenceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        Sort.Direction direction = dir.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageResponse<InventoryTransactionResponse> result = transactionService.list(
                page, size, sort, direction, productId, productName, transactionType, referenceType, referenceId, from, to
        );
        ApiResponse<PageResponse<InventoryTransactionResponse>> response = new ApiResponse<>();
        response.setResult(result);
        return response;
    }
}


