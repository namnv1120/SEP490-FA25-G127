package com.g127.snapbuy.auth.controller;

import com.g127.snapbuy.auth.dto.request.AuthenticationRequest;
import com.g127.snapbuy.auth.dto.request.IntrospectRequest;
import com.g127.snapbuy.auth.dto.request.LogoutRequest;
import com.g127.snapbuy.auth.dto.request.RefreshRequest;
import com.g127.snapbuy.common.response.ApiResponse;
import com.g127.snapbuy.auth.dto.response.AuthenticationResponse;
import com.g127.snapbuy.auth.dto.response.IntrospectResponse;
import com.g127.snapbuy.auth.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final com.g127.snapbuy.tenant.service.TenantService tenantService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> authenticate(
            @RequestBody @Valid AuthenticationRequest req,
            jakarta.servlet.http.HttpServletRequest request) {
        
        // Priority 1: Get from X-Tenant-Slug header (frontend sends this from subdomain detection)
        String tenantCode = request.getHeader("X-Tenant-Slug");
        
        // Priority 2: Auto-detect from subdomain (e.g., shop1.snapbuy.com)
        if (tenantCode == null || tenantCode.isEmpty()) {
            tenantCode = com.g127.snapbuy.tenant.util.TenantResolver.resolveFromSubdomain(request);
        }
        
        // Priority 3: Fallback to tenantCode in request body (for backward compatibility)
        if (tenantCode == null || tenantCode.isEmpty()) {
            tenantCode = req.getTenantCode();
        }
        
        if (tenantCode == null || tenantCode.isEmpty()) {
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
            response.setCode(4000);
            response.setMessage("Không thể xác định cửa hàng. Vui lòng nhập mã cửa hàng để đăng nhập.");
            return response;
        }
        
        // Set tenant context before authentication
        try {
            var tenant = tenantService.getTenantByCode(tenantCode);
            
            if (!tenant.getIsActive()) {
                ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
                response.setCode(4003);
                response.setMessage("Cửa hàng '" + tenantCode + "' đã bị tạm khóa. Vui lòng liên hệ quản trị viên.");
                return response;
            }
            
            com.g127.snapbuy.tenant.context.TenantContext.setCurrentTenant(tenant.getTenantId().toString());
            
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
            response.setResult(authenticationService.authenticate(req));
            return response;
        } catch (NoSuchElementException e) {
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
            response.setCode(4004);
            response.setMessage("Cửa hàng với mã '" + tenantCode + "' không tồn tại. Vui lòng kiểm tra lại mã cửa hàng.");
            return response;
        } finally {
            com.g127.snapbuy.tenant.context.TenantContext.clear();
        }
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody @Valid IntrospectRequest req) {
        ApiResponse<IntrospectResponse> response = new ApiResponse<>();
        response.setResult(authenticationService.introspect(req));
        return response;
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refresh(@RequestBody @Valid RefreshRequest req) {
        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setResult(authenticationService.refreshToken(req));
        return response;
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest req) {
        authenticationService.logout(req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Đăng xuất thành công");
        return response;
    }
}
