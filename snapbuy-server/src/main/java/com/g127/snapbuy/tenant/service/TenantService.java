package com.g127.snapbuy.tenant.service;

import com.g127.snapbuy.tenant.dto.request.TenantCreateRequest;
import com.g127.snapbuy.tenant.dto.response.TenantResponse;

import java.util.List;
import java.util.UUID;

public interface TenantService {
    TenantResponse createTenant(TenantCreateRequest request);
    TenantResponse getTenant(UUID tenantId);
    List<TenantResponse> getAllTenants();
    TenantResponse updateTenantStatus(UUID tenantId, Boolean isActive);
    void deleteTenant(UUID tenantId);
    TenantResponse getTenantByCode(String tenantCode);
}
