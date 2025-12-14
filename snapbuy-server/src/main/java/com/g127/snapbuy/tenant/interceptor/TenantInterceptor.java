package com.g127.snapbuy.tenant.interceptor;

import com.g127.snapbuy.tenant.context.TenantContext;
import com.g127.snapbuy.tenant.entity.Tenant;
import com.g127.snapbuy.tenant.repository.TenantRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

@Component
@Slf4j
@RequiredArgsConstructor
public class TenantInterceptor implements HandlerInterceptor {
    
    private static final String TENANT_ID_HEADER = "X-Tenant-ID";
    private static final String TENANT_SLUG_HEADER = "X-Tenant-Slug";
    private static final String IS_ADMIN_HEADER = "X-Is-Admin";
    
    private final TenantRepository tenantRepository;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String tenantId = request.getHeader(TENANT_ID_HEADER);
        String tenantSlug = request.getHeader(TENANT_SLUG_HEADER);
        String isAdmin = request.getHeader(IS_ADMIN_HEADER);
        
        // Nếu là admin request, bỏ qua tenant context
        if ("true".equalsIgnoreCase(isAdmin)) {
            log.debug("Admin request detected, skipping tenant context");
            return true;
        }
        
        // Ưu tiên dùng tenantId nếu có (user đã login)
        if (tenantId != null && !tenantId.isEmpty()) {
            TenantContext.setCurrentTenant(tenantId);
            log.debug("Tenant context set from X-Tenant-ID: {}", tenantId);
        }
        // Nếu không có tenantId nhưng có tenantSlug (từ subdomain)
        else if (tenantSlug != null && !tenantSlug.isEmpty()) {
            // Resolve tenantSlug thành tenantId
            Optional<Tenant> tenant = tenantRepository.findByTenantCode(tenantSlug);
            if (tenant.isPresent() && tenant.get().getIsActive()) {
                String resolvedTenantId = tenant.get().getTenantId().toString();
                TenantContext.setCurrentTenant(resolvedTenantId);
                log.debug("Tenant context set from X-Tenant-Slug '{}': {}", tenantSlug, resolvedTenantId);
            } else {
                log.warn("Tenant with code '{}' not found or inactive", tenantSlug);
            }
        } else {
            log.debug("No tenant ID or slug found in request");
        }
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                                Object handler, Exception ex) {
        TenantContext.clear();
    }
}
