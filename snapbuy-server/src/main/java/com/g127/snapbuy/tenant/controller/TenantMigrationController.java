package com.g127.snapbuy.tenant.controller;

import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.tenant.config.TenantFlywayRunner;
import com.g127.snapbuy.tenant.context.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tenant")
@RequiredArgsConstructor
public class TenantMigrationController {

    private final TenantFlywayRunner flywayRunner;

    @PostMapping("/run-migrations")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> runMigrations() {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            ApiResponse<String> response = new ApiResponse<>();
            response.setCode(4000);
            response.setMessage("Không tìm thấy tenant context");
            return response;
        }
        
        try {
            flywayRunner.runMigrations(tenantId);
            ApiResponse<String> response = new ApiResponse<>();
            response.setMessage("Đã chạy migrations thành công cho tenant: " + tenantId);
            response.setResult("OK");
            return response;
        } catch (Exception e) {
            ApiResponse<String> response = new ApiResponse<>();
            response.setCode(5000);
            response.setMessage("Lỗi khi chạy migrations: " + e.getMessage());
            return response;
        }
    }
}
