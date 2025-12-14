package com.g127.snapbuy.tenant.controller;

import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.tenant.dto.request.TenantCreateRequest;
import com.g127.snapbuy.tenant.dto.response.TenantResponse;
import com.g127.snapbuy.tenant.service.DemoDataService;
import com.g127.snapbuy.tenant.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    private final DemoDataService demoDataService;
    
    // ========== PUBLIC ENDPOINTS (không cần auth) ==========
    
    /**
     * Validate tenant từ subdomain (frontend check khi load trang)
     * Public endpoint - không cần authentication
     */
    @GetMapping("/validate/{tenantSlug}")
    public ApiResponse<TenantResponse> validateTenant(@PathVariable String tenantSlug) {
        try {
            TenantResponse tenant = tenantService.getTenantByCode(tenantSlug);
            
            if (!tenant.getIsActive()) {
                ApiResponse<TenantResponse> response = new ApiResponse<>();
                response.setCode(4003);
                response.setMessage("Cửa hàng đã bị vô hiệu hóa");
                return response;
            }
            
            ApiResponse<TenantResponse> response = new ApiResponse<>();
            response.setResult(tenant);
            response.setMessage("Cửa hàng hợp lệ");
            return response;
        } catch (Exception e) {
            ApiResponse<TenantResponse> response = new ApiResponse<>();
            response.setCode(4004);
            response.setMessage("Cửa hàng không tồn tại");
            return response;
        }
    }
    
    /**
     * Lấy thông tin cơ bản tenant (logo, tên, ...) - public
     */
    @GetMapping("/{tenantSlug}/info")
    public ApiResponse<TenantResponse> getTenantPublicInfo(@PathVariable String tenantSlug) {
        ApiResponse<TenantResponse> response = new ApiResponse<>();
        response.setResult(tenantService.getTenantByCode(tenantSlug));
        response.setMessage("Lấy thông tin cửa hàng thành công");
        return response;
    }
    
    // ========== ADMIN ENDPOINTS (cần ADMIN role) ==========

    @PostMapping("/admin")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<TenantResponse> createTenant(@Valid @RequestBody TenantCreateRequest request) {
        try {
            ApiResponse<TenantResponse> response = new ApiResponse<>();
            response.setResult(tenantService.createTenant(request));
            response.setMessage("Tạo cửa hàng '" + request.getTenantCode() + "' thành công. Tài khoản chủ cửa hàng đã được tạo.");
            return response;
        } catch (IllegalArgumentException e) {
            ApiResponse<TenantResponse> response = new ApiResponse<>();
            response.setCode(4002);
            response.setMessage(e.getMessage());
            return response;
        } catch (Exception e) {
            ApiResponse<TenantResponse> response = new ApiResponse<>();
            response.setCode(5000);
            response.setMessage("Lỗi khi tạo cửa hàng: " + e.getMessage());
            return response;
        }
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<List<TenantResponse>> getAllTenants() {
        ApiResponse<List<TenantResponse>> response = new ApiResponse<>();
        response.setResult(tenantService.getAllTenants());
        response.setMessage("Lấy danh sách cửa hàng thành công");
        return response;
    }

    @GetMapping("/admin/{tenantId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<TenantResponse> getTenant(@PathVariable UUID tenantId) {
        ApiResponse<TenantResponse> response = new ApiResponse<>();
        response.setResult(tenantService.getTenant(tenantId));
        response.setMessage("Lấy thông tin cửa hàng thành công");
        return response;
    }

    @GetMapping("/admin/code/{tenantCode}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<TenantResponse> getTenantByCode(@PathVariable String tenantCode) {
        ApiResponse<TenantResponse> response = new ApiResponse<>();
        response.setResult(tenantService.getTenantByCode(tenantCode));
        response.setMessage("Lấy thông tin cửa hàng thành công");
        return response;
    }

    @PatchMapping("/admin/{tenantId}/status")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<TenantResponse> updateTenantStatus(
            @PathVariable UUID tenantId,
            @RequestParam Boolean isActive) {
        ApiResponse<TenantResponse> response = new ApiResponse<>();
        response.setResult(tenantService.updateTenantStatus(tenantId, isActive));
        response.setMessage("Cập nhật trạng thái cửa hàng thành công");
        return response;
    }

    @DeleteMapping("/admin/{tenantId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<Void> deleteTenant(@PathVariable UUID tenantId) {
        tenantService.deleteTenant(tenantId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Xóa cửa hàng thành công");
        return response;
    }

    @PostMapping("/admin/{tenantId}/demo-data")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<Void> insertDemoData(@PathVariable UUID tenantId) {
        String tenantIdStr = tenantId.toString();
        
        // Check if demo data already exists
        if (demoDataService.hasDemoData(tenantIdStr)) {
            ApiResponse<Void> response = new ApiResponse<>();
            response.setMessage("Cửa hàng đã có dữ liệu mẫu");
            response.setCode(400);
            return response;
        }
        
        // Insert demo data
        demoDataService.insertDemoData(tenantIdStr);
        
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Thêm dữ liệu mẫu thành công");
        return response;
    }

    @GetMapping("/admin/{tenantId}/demo-data/check")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<Boolean> checkDemoData(@PathVariable UUID tenantId) {
        String tenantIdStr = tenantId.toString();
        boolean hasDemoData = demoDataService.hasDemoData(tenantIdStr);
        
        ApiResponse<Boolean> response = new ApiResponse<>();
        response.setResult(hasDemoData);
        response.setMessage(hasDemoData ? "Cửa hàng đã có dữ liệu mẫu" : "Cửa hàng chưa có dữ liệu mẫu");
        return response;
    }
}
