package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.AccountDto;
import com.g127.snapbuy.dto.ChangePasswordRequest;
import com.g127.snapbuy.service.AccountService;
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
    public ResponseEntity<AccountDto> createAccount(@RequestBody AccountDto dto) {
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
    public ResponseEntity<AccountDto> updateAccount(@PathVariable UUID accountId, @RequestBody AccountDto dto) {
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

    // POST /api/accounts/{accountId}/change-password?oldPassword=...&newPassword=...
    @PostMapping("/{accountId}/change-password")
    public ResponseEntity<AccountDto> changePassword(@PathVariable UUID accountId, @RequestParam String oldPassword, @RequestParam String newPassword) {
        AccountDto changed = accountService.changePassword(accountId, oldPassword, newPassword);
        return ResponseEntity.ok(changed);
    }

    @PutMapping("/me/change-password")
    public ResponseEntity<?> changePasswordMe(@RequestBody Map<String, String> req) {
        String oldPassword = req.get("oldPassword");
        String newPassword = req.get("newPassword");
        accountService.changePasswordForCurrentUser(oldPassword, newPassword);
        return ResponseEntity.ok(Map.of("code", "SUCCESS", "message", "Password changed successfully"));
    }



}
