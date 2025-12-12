package com.g127.snapbuy.tenant.controller;

import com.g127.snapbuy.response.ApiResponse;
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
@RequestMapping("/api/admin/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TenantController {

    private final TenantService tenantService;
    private final DemoDataService demoDataService;

    @PostMapping
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

    @GetMapping
    public ApiResponse<List<TenantResponse>> getAllTenants() {
        ApiResponse<List<TenantResponse>> response = new ApiResponse<>();
        response.setResult(tenantService.getAllTenants());
        response.setMessage("Lấy danh sách cửa hàng thành công");
        return response;
    }

    @GetMapping("/{tenantId}")
    public ApiResponse<TenantResponse> getTenant(@PathVariable UUID tenantId) {
        ApiResponse<TenantResponse> response = new ApiResponse<>();
        response.setResult(tenantService.getTenant(tenantId));
        response.setMessage("Lấy thông tin cửa hàng thành công");
        return response;
    }

    @GetMapping("/code/{tenantCode}")
    public ApiResponse<TenantResponse> getTenantByCode(@PathVariable String tenantCode) {
        ApiResponse<TenantResponse> response = new ApiResponse<>();
        response.setResult(tenantService.getTenantByCode(tenantCode));
        response.setMessage("Lấy thông tin cửa hàng thành công");
        return response;
    }

    @PatchMapping("/{tenantId}/status")
    public ApiResponse<TenantResponse> updateTenantStatus(
            @PathVariable UUID tenantId,
            @RequestParam Boolean isActive) {
        ApiResponse<TenantResponse> response = new ApiResponse<>();
        response.setResult(tenantService.updateTenantStatus(tenantId, isActive));
        response.setMessage("Cập nhật trạng thái cửa hàng thành công");
        return response;
    }

    @DeleteMapping("/{tenantId}")
    public ApiResponse<Void> deleteTenant(@PathVariable UUID tenantId) {
        tenantService.deleteTenant(tenantId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Xóa cửa hàng thành công");
        return response;
    }

    @PostMapping("/{tenantId}/demo-data")
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

    @GetMapping("/{tenantId}/demo-data/check")
    public ApiResponse<Boolean> checkDemoData(@PathVariable UUID tenantId) {
        String tenantIdStr = tenantId.toString();
        boolean hasDemoData = demoDataService.hasDemoData(tenantIdStr);
        
        ApiResponse<Boolean> response = new ApiResponse<>();
        response.setResult(hasDemoData);
        response.setMessage(hasDemoData ? "Cửa hàng đã có dữ liệu mẫu" : "Cửa hàng chưa có dữ liệu mẫu");
        return response;
    }
}
