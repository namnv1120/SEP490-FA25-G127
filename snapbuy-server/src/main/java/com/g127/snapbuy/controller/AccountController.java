package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.AccountResponse;
import com.g127.snapbuy.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<AccountResponse> createAccount(@Valid @RequestBody AccountCreateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.createAccount(req));
        return response;
    }

    @GetMapping
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<List<AccountResponse>> getAccounts() {
        ApiResponse<List<AccountResponse>> response = new ApiResponse<>();
        response.setResult(accountService.getAccounts());
        return response;
    }

    @GetMapping("/{accountId}")
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<AccountResponse> getAccount(@PathVariable UUID accountId) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.getAccount(accountId));
        return response;
    }

    @GetMapping("/my-info")
    public ApiResponse<AccountResponse> getMyInfo() {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.getMyInfo());
        return response;
    }

    @PutMapping("/{accountId}")
    public ApiResponse<AccountResponse> updateAccount(@PathVariable UUID accountId,
                                                      @Valid @RequestBody AccountUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.updateAccount(accountId, req));
        return response;
    }

    @DeleteMapping("/{accountId}")
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<Void> deleteAccount(@PathVariable UUID accountId) {
        accountService.deleteAccount(accountId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Account deleted successfully");
        return response;
    }

    @PostMapping("/{accountId}/assign-role/{roleId}")
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<AccountResponse> assignRole(@PathVariable UUID accountId, @PathVariable UUID roleId) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.assignRole(accountId, roleId));
        return response;
    }

    @PostMapping("/{accountId}/change-password")
    public ApiResponse<AccountResponse> changePassword(@PathVariable UUID accountId,
                                                       @Valid @RequestBody ChangePasswordRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.changePassword(accountId, req));
        return response;
    }

    @PutMapping("/me/change-password")
    public ApiResponse<Void> changePasswordMe(@Valid @RequestBody ChangePasswordRequest req) {
        accountService.changePasswordForCurrentUser(req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Password changed successfully");
        response.setResult(null);
        return response;
    }

    @PostMapping("/shop-owners")
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<AccountResponse> createShopOwner(@Valid @RequestBody AccountCreateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.createShopOwner(req));
        return response;
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('Shop Owner')")
    public ApiResponse<AccountResponse> createStaff(@Valid @RequestBody AccountCreateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.createStaff(req));
        return response;
    }

    @PutMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('Shop Owner')")
    public ApiResponse<AccountResponse> updateStaffByOwner(@PathVariable UUID staffId,
                                                           @Valid @RequestBody StaffOwnerUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.updateStaffByOwner(staffId, req));
        return response;
    }

    @PutMapping("/staff/{staffId}/roles")
    @PreAuthorize("hasRole('Shop Owner')")
    public ApiResponse<AccountResponse> updateStaffRolesByOwner(@PathVariable UUID staffId,
                                                                @Valid @RequestBody StaffRoleUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.updateStaffRolesByOwner(staffId, req));
        return response;
    }

    @PutMapping("/admin/{accountId}")
    @PreAuthorize("hasRole('Admin')")
    public ApiResponse<AccountResponse> adminUpdateAccount(@PathVariable UUID accountId,
                                                           @Valid @RequestBody AccountUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.adminUpdateAccount(accountId, req));
        return response;
    }
}
