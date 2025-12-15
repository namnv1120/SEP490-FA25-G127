package com.g127.snapbuy.admin.controller;

import com.g127.snapbuy.admin.dto.response.AdminAccountResponse;
import com.g127.snapbuy.admin.service.AdminAccountService;
import com.g127.snapbuy.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Quản trị viên')")
public class AdminAccountController {

    private final AdminAccountService adminAccountService;

    /**
     * Get all accounts from all tenants (master database)
     */
    @GetMapping
    public ApiResponse<List<AdminAccountResponse>> getAllAccounts() {
        ApiResponse<List<AdminAccountResponse>> response = new ApiResponse<>();
        response.setResult(adminAccountService.getAllAccountsFromAllTenants());
        response.setMessage("Lấy danh sách tất cả tài khoản thành công.");
        return response;
    }

    /**
     * Search accounts across all tenants
     */
    @GetMapping("/search")
    public ApiResponse<List<AdminAccountResponse>> searchAccounts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String role) {
        ApiResponse<List<AdminAccountResponse>> response = new ApiResponse<>();
        response.setResult(adminAccountService.searchAccountsFromAllTenants(keyword, active, role));
        response.setMessage("Tìm kiếm tài khoản thành công.");
        return response;
    }

    /**
     * Delete account from any tenant
     */
    @DeleteMapping("/{tenantId}/{accountId}")
    public ApiResponse<Void> deleteAccount(
            @PathVariable String tenantId,
            @PathVariable UUID accountId) {
        adminAccountService.deleteAccountFromTenant(tenantId, accountId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Xóa tài khoản thành công.");
        return response;
    }

    /**
     * Toggle account status (active/inactive)
     */
    @PatchMapping("/{tenantId}/{accountId}/toggle-status")
    public ApiResponse<Void> toggleAccountStatus(
            @PathVariable String tenantId,
            @PathVariable UUID accountId) {
        adminAccountService.toggleAccountStatus(tenantId, accountId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Đã cập nhật trạng thái tài khoản thành công.");
        return response;
    }
}
