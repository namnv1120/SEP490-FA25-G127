package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.*;
import com.g127.snapbuy.dto.response.AccountResponse;
import com.g127.snapbuy.dto.response.PageResponse;
import com.g127.snapbuy.service.AccountService;
import com.g127.snapbuy.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<AccountResponse> createAccount(@Valid @RequestBody AccountCreateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.createAccount(req));
        response.setMessage("Tạo tài khoản thành công.");
        return response;
    }

    @GetMapping
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<List<AccountResponse>> getAccounts() {
        ApiResponse<List<AccountResponse>> response = new ApiResponse<>();
        response.setResult(accountService.getAccounts());
        response.setMessage("Lấy danh sách tài khoản thành công.");
        return response;
    }

    @GetMapping("/{accountId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<AccountResponse> getAccount(@PathVariable UUID accountId) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.getAccount(accountId));
        response.setMessage("Lấy thông tin tài khoản thành công.");
        return response;
    }

    @GetMapping("/my-info")
    public ApiResponse<AccountResponse> getMyInfo() {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.getMyInfo());
        response.setMessage("Lấy thông tin tài khoản của tôi thành công.");
        return response;
    }

    @PutMapping(value = "/{accountId}", consumes = {"multipart/form-data"})
    public ApiResponse<AccountResponse> updateAccount(@PathVariable UUID accountId,
                                                      @ModelAttribute @Valid AccountUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.updateAccount(accountId, req));
        response.setMessage("Cập nhật tài khoản thành công.");
        return response;
    }

    @PutMapping(value = "/{accountId}/json", consumes = {"application/json"})
    public ApiResponse<AccountResponse> updateAccountJson(@PathVariable UUID accountId,
                                                          @RequestBody @Valid AccountUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.updateAccount(accountId, req));
        response.setMessage("Cập nhật tài khoản thành công.");
        return response;
    }

    @DeleteMapping("/{accountId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<Void> deleteAccount(@PathVariable UUID accountId) {
        accountService.deleteAccount(accountId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setResult(null);
        response.setMessage("Tài khoản đã được xóa thành công.");
        return response;
    }

    @PostMapping("/{accountId}/assign-role/{roleId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<AccountResponse> assignRole(@PathVariable UUID accountId, @PathVariable UUID roleId) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.assignRole(accountId, roleId));
        response.setMessage("Gán vai trò cho tài khoản thành công.");
        return response;
    }

    @PostMapping("/{accountId}/change-password")
    public ApiResponse<AccountResponse> changePassword(@PathVariable UUID accountId,
                                                       @Valid @RequestBody ChangePasswordRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.changePassword(accountId, req));
        response.setMessage("Đổi mật khẩu thành công.");
        return response;
    }

    @PutMapping("/me/change-password")
    public ApiResponse<Void> changePasswordMe(@Valid @RequestBody ChangePasswordRequest req) {
        accountService.changePasswordForCurrentUser(req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Đổi mật khẩu thành công.");
        response.setResult(null);
        return response;
    }

    @PostMapping("/shop-owners")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<AccountResponse> createShopOwner(@Valid @RequestBody AccountCreateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.createShopOwner(req));
        response.setMessage("Tạo chủ cửa hàng thành công.");
        return response;
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<AccountResponse> createStaff(@Valid @RequestBody AccountCreateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.createStaff(req));
        response.setMessage("Tạo nhân viên thành công.");
        return response;
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<AccountResponse> getStaffByIdForOwner(@PathVariable UUID staffId) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.getStaffByIdForOwner(staffId));
        response.setMessage("Lấy thông tin nhân viên thành công.");
        return response;
    }


    @PutMapping("/staff/{staffId}")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<AccountResponse> updateStaffByOwner(@PathVariable UUID staffId,
                                                           @Valid @RequestBody StaffOwnerUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.updateStaffByOwner(staffId, req));
        response.setMessage("Cập nhật thông tin nhân viên thành công.");
        return response;
    }

    @PutMapping("/staff/{staffId}/roles")
    @PreAuthorize("hasRole('Chủ cửa hàng')")
    public ApiResponse<AccountResponse> updateStaffRolesByOwner(@PathVariable UUID staffId,
                                                                @Valid @RequestBody StaffRoleUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.updateStaffRolesByOwner(staffId, req));
        response.setMessage("Cập nhật vai trò nhân viên thành công.");
        return response;
    }

    @PutMapping("/admin/{accountId}")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<AccountResponse> adminUpdateAccount(@PathVariable UUID accountId,
                                                           @Valid @RequestBody AccountUpdateRequest req) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.adminUpdateAccount(accountId, req));
        response.setMessage("Quản trị viên cập nhật tài khoản thành công.");
        return response;
    }

    @DeleteMapping("/{accountId}/roles/{roleId}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<Void> unassignRole(@PathVariable UUID accountId, @PathVariable UUID roleId) {
        accountService.unassignRole(accountId, roleId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Gỡ vai trò khỏi tài khoản thành công.");
        response.setResult(null);
        return response;
    }

    @PatchMapping("/{accountId}/toggle-status")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<AccountResponse> toggleAccountStatus(@PathVariable UUID accountId) {
        ApiResponse<AccountResponse> response = new ApiResponse<>();
        response.setResult(accountService.toggleAccountStatus(accountId));
        response.setMessage("Đã cập nhật trạng thái tài khoản thành công.");
        return response;
    }

    @PostMapping("/me/request-email-verification")
    public ApiResponse<Void> requestEmailVerification(@Valid @RequestBody EmailVerificationRequest req) {
        UUID accountId = accountService.getMyInfo().getId();
        emailVerificationService.requestOtp(accountId, req.getEmail());
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Đã gửi mã xác nhận đến email. Vui lòng kiểm tra hộp thư của bạn.");
        return response;
    }

    @PostMapping("/me/verify-email-otp")
    public ApiResponse<Void> verifyEmailOtp(@Valid @RequestBody VerifyEmailOtpRequest req) {
        UUID accountId = accountService.getMyInfo().getId();
        emailVerificationService.verifyOtp(accountId, req);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setMessage("Xác nhận email thành công!");
        return response;
    }

    @GetMapping("/by-role/{roleName}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<List<AccountResponse>> getAccountsByRoleName(@PathVariable String roleName) {
        ApiResponse<List<AccountResponse>> response = new ApiResponse<>();
        response.setResult(accountService.getAccountsByRoleName(roleName));
        response.setMessage("Lấy danh sách tài khoản theo vai trò thành công.");
        return response;
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<List<AccountResponse>> searchAccounts(@RequestParam(required = false) String keyword,
                                                             @RequestParam(required = false) Boolean active,
                                                             @RequestParam(required = false) String role) {
        ApiResponse<List<AccountResponse>> response = new ApiResponse<>();
        response.setResult(accountService.searchAccounts(keyword, active, role));
        response.setMessage("Tìm kiếm tài khoản thành công.");
        return response;
    }

    @GetMapping("/search-paged")
    @PreAuthorize("hasRole('Quản trị viên')")
    public ApiResponse<PageResponse<AccountResponse>> searchAccountsPaged(@RequestParam(required = false) String keyword,
                                                                          @RequestParam(required = false) Boolean active,
                                                                          @RequestParam(required = false) String role,
                                                                          @RequestParam(defaultValue = "0") int page,
                                                                          @RequestParam(defaultValue = "10") int size,
                                                                          @RequestParam(defaultValue = "fullName") String sortBy,
                                                                          @RequestParam(defaultValue = "ASC") String sortDir) {
        var direction = "DESC".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        var pageable = PageRequest.of(
                Math.max(page, 0), Math.min(Math.max(size, 1), 200),
                Sort.by(direction, sortBy)
        );
        ApiResponse<PageResponse<AccountResponse>> response = new ApiResponse<>();
        response.setResult(accountService.searchAccountsPaged(keyword, active, role, pageable));
        response.setMessage("Tìm kiếm tài khoản (phân trang) thành công.");
        return response;
    }

    @GetMapping("/staff/search-paged")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<PageResponse<AccountResponse>> searchStaffAccountsPaged(@RequestParam(required = false) String keyword,
                                                                               @RequestParam(required = false) Boolean active,
                                                                               @RequestParam(required = false) String role,
                                                                               @RequestParam(defaultValue = "0") int page,
                                                                               @RequestParam(defaultValue = "10") int size,
                                                                               @RequestParam(defaultValue = "fullName") String sortBy,
                                                                               @RequestParam(defaultValue = "ASC") String sortDir) {
        var direction = "DESC".equalsIgnoreCase(sortDir)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        var pageable = PageRequest.of(
                Math.max(page, 0), Math.min(Math.max(size, 1), 200),
                Sort.by(direction, sortBy)
        );
        ApiResponse<PageResponse<AccountResponse>> response = new ApiResponse<>();
        response.setResult(accountService.searchStaffAccountsPaged(keyword, active, role, pageable));
        response.setMessage("Tìm kiếm tài khoản nhân viên (phân trang) thành công.");
        return response;
    }
}
