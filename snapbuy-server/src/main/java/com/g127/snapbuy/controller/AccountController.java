package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.AccountDto;
import com.g127.snapbuy.dto.request.ChangePasswordRequest;
import com.g127.snapbuy.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountDto> createAccount(@Valid @RequestBody AccountDto dto) {
        AccountDto created = accountService.createAccount(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<AccountDto>> getAccounts() {
        return ResponseEntity.ok(accountService.getAccounts());
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<AccountDto> getAccount(@PathVariable UUID accountId) {
        return ResponseEntity.ok(accountService.getAccount(accountId));
    }

    @GetMapping("/my-info")
    public ResponseEntity<AccountDto> getMyInfo() {
        return ResponseEntity.ok(accountService.getMyInfo());
    }

    @PutMapping("/{accountId}")
    public ResponseEntity<AccountDto> updateAccount(@PathVariable UUID accountId,
                                                    @Valid @RequestBody AccountDto dto) {
        AccountDto updated = accountService.updateAccount(accountId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID accountId) {
        accountService.deleteAccount(accountId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{accountId}/assign-role/{roleId}")
    public ResponseEntity<AccountDto> assignRole(@PathVariable UUID accountId, @PathVariable UUID roleId) {
        return ResponseEntity.ok(accountService.assignRole(accountId, roleId));
    }

    @PostMapping("/{accountId}/change-password")
    public ResponseEntity<AccountDto> changePassword(
            @PathVariable UUID accountId,
            @Valid @RequestBody ChangePasswordRequest req
    ) {
        AccountDto changed = accountService.changePassword(accountId, req);
        return ResponseEntity.ok(changed);
    }

    @PutMapping("/me/change-password")
    public ResponseEntity<?> changePasswordMe(@Valid @RequestBody ChangePasswordRequest req) {
        accountService.changePasswordForCurrentUser(req);
        return ResponseEntity.ok(
                Map.of("code", "SUCCESS", "message", "Password changed successfully")
        );
    }
}
