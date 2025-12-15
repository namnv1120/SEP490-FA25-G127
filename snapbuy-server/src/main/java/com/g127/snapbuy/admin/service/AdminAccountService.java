package com.g127.snapbuy.admin.service;

import com.g127.snapbuy.admin.dto.response.AdminAccountResponse;

import java.util.List;
import java.util.UUID;

public interface AdminAccountService {
    
    /**
     * Get all accounts from all tenants
     */
    List<AdminAccountResponse> getAllAccountsFromAllTenants();
    
    /**
     * Search accounts across all tenants
     */
    List<AdminAccountResponse> searchAccountsFromAllTenants(String keyword, Boolean active, String role);
    
    /**
     * Delete account from specific tenant
     */
    void deleteAccountFromTenant(String tenantId, UUID accountId);
    
    /**
     * Toggle account status (active/inactive)
     */
    void toggleAccountStatus(String tenantId, UUID accountId);
}
