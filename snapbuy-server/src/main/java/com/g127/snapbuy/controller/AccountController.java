package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.request.AccountCreateRequest;
import com.g127.snapbuy.dto.request.AccountUpdateRequest;
import com.g127.snapbuy.dto.request.ChangePasswordRequest;
import com.g127.snapbuy.dto.response.AccountResponse;
import com.g127.snapbuy.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountCreateRequest req) {
        AccountResponse created = accountService.createAccount(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<List<AccountResponse>> getAccounts() {
        return ResponseEntity.ok(accountService.getAccounts());
    }

    @GetMapping("/{accountId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable UUID accountId) {
        return ResponseEntity.ok(accountService.getAccount(accountId));
    }

    @GetMapping("/my-info")
    public ResponseEntity<AccountResponse> getMyInfo() {
        return ResponseEntity.ok(accountService.getMyInfo());
    }

    @PutMapping("/{accountId}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable UUID accountId,
                                                         @Valid @RequestBody AccountUpdateRequest req) {
        AccountResponse updated = accountService.updateAccount(accountId, req);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{accountId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID accountId) {
        accountService.deleteAccount(accountId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{accountId}/assign-role/{roleId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<AccountResponse> assignRole(@PathVariable UUID accountId, @PathVariable UUID roleId) {
        return ResponseEntity.ok(accountService.assignRole(accountId, roleId));
    }

    @PostMapping("/{accountId}/change-password")
    public ResponseEntity<AccountResponse> changePassword(
            @PathVariable UUID accountId,
            @Valid @RequestBody ChangePasswordRequest req
    ) {
        AccountResponse changed = accountService.changePassword(accountId, req);
        return ResponseEntity.ok(changed);
    }

    @PutMapping("/me/change-password")
    public ResponseEntity<?> changePasswordMe(@Valid @RequestBody ChangePasswordRequest req) {
        accountService.changePasswordForCurrentUser(req);
        return ResponseEntity.ok(Map.of("code", "SUCCESS", "message", "Password changed successfully"));
    }

    @PostMapping("/shop-owners")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<AccountResponse> createShopOwner(@Valid @RequestBody AccountCreateRequest req) {
        AccountResponse created = accountService.createShopOwner(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('Shop Owner')")
    public ResponseEntity<AccountResponse> createStaff(@Valid @RequestBody AccountCreateRequest req) {
        AccountResponse created = accountService.createStaff(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
