package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.response.InventoryTransactionResponse;
import com.g127.snapbuy.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/inventory-transactions")
@RequiredArgsConstructor
@Slf4j
public class InventoryTransactionController {

    private final InventoryTransactionService transactionService;

    @GetMapping
    public ApiResponse<java.util.List<InventoryTransactionResponse>> getAll() {
        ApiResponse<java.util.List<InventoryTransactionResponse>> response = new ApiResponse<>();
        response.setResult(transactionService.getAll());
        return response;
    }
}


