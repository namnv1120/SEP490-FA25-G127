package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.AccountResponse;
import com.g127.snapbuy.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public AccountResponse createAccount(@Valid @RequestBody AccountCreateRequest req) {
        return accountService.createAccount(req);
    }

    @GetMapping
    @PreAuthorize("hasRole('Admin')")
    public List<AccountResponse> getAccounts() {
        return accountService.getAccounts();
    }

    @GetMapping("/{accountId}")
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse getAccount(@PathVariable UUID accountId) {
        return accountService.getAccount(accountId);
    }

    @GetMapping("/my-info")
    public AccountResponse getMyInfo() {
        return accountService.getMyInfo();
    }

    @PutMapping("/{accountId}")
    public AccountResponse updateAccount(@PathVariable UUID accountId,
                                         @Valid @RequestBody AccountUpdateRequest req) {
        return accountService.updateAccount(accountId, req);
    }

    @DeleteMapping("/{accountId}")
    @PreAuthorize("hasRole('Admin')")
    public void deleteAccount(@PathVariable UUID accountId) {
        accountService.deleteAccount(accountId);
    }

    @PostMapping("/{accountId}/assign-role/{roleId}")
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse assignRole(@PathVariable UUID accountId, @PathVariable UUID roleId) {
        return accountService.assignRole(accountId, roleId);
    }

    @PostMapping("/{accountId}/change-password")
    public AccountResponse changePassword(@PathVariable UUID accountId,
                                          @Valid @RequestBody ChangePasswordRequest req) {
        return accountService.changePassword(accountId, req);
    }

    @PutMapping("/me/change-password")
    public Map<String, String> changePasswordMe(@Valid @RequestBody ChangePasswordRequest req) {
        accountService.changePasswordForCurrentUser(req);
        return Map.of("code", "SUCCESS", "message", "Password changed successfully");
    }

    @PostMapping("/shop-owners")
    @PreAuthorize("hasRole('Admin')")
    public AccountResponse createShopOwner(@Valid @RequestBody AccountCreateRequest req) {
        return accountService.createShopOwner(req);
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('Shop Owner')")
    public AccountResponse createStaff(@Valid @RequestBody AccountCreateRequest req) {
        return accountService.createStaff(req);
    }

    @PutMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('Shop Owner')")
    public AccountResponse updateStaffByOwner(@PathVariable UUID staffId,
                                              @Valid @RequestBody StaffOwnerUpdateRequest req) {
        return accountService.updateStaffByOwner(staffId, req);
    }

    @PutMapping("/staff/{staffId}/roles")
    @PreAuthorize("hasRole('Shop Owner')")
    public AccountResponse updateStaffRolesByOwner(@PathVariable UUID staffId,
                                                   @Valid @RequestBody StaffRoleUpdateRequest req) {
        return accountService.updateStaffRolesByOwner(staffId, req);
    }
}
