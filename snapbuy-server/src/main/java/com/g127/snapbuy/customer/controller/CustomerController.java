package com.g127.snapbuy.customer.controller;

import com.g127.snapbuy.response.ApiResponse;
import com.g127.snapbuy.customer.dto.request.CustomerCreateRequest;
import com.g127.snapbuy.customer.dto.request.CustomerUpdateRequest;
import com.g127.snapbuy.customer.dto.response.CustomerResponse;
import com.g127.snapbuy.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(maxAge = 3600)
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<CustomerResponse> createCustomer(@RequestBody @Valid CustomerCreateRequest request) {
        ApiResponse<CustomerResponse> response = new ApiResponse<>();
        response.setResult(customerService.createCustomer(request));
        return response;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<List<CustomerResponse>> getAllCustomers() {
        ApiResponse<List<CustomerResponse>> response = new ApiResponse<>();
        response.setResult(customerService.getAllCustomers());
        return response;
    }

    @GetMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<CustomerResponse> getCustomerById(@PathVariable("id") UUID id) {
        ApiResponse<CustomerResponse> response = new ApiResponse<>();
        response.setResult(customerService.getCustomerById(id));
        return response;
    }

    @PutMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<CustomerResponse> updateCustomer(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CustomerUpdateRequest request) {
        ApiResponse<CustomerResponse> response = new ApiResponse<>();
        response.setResult(customerService.updateCustomer(id, request));
        return response;
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> deleteCustomer(@PathVariable("id") UUID id) {
        customerService.deleteCustomer(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Khách hàng đã được xoá");
        return response;
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<List<CustomerResponse>> searchCustomer(@RequestParam("keyword") String keyword) {
        ApiResponse<List<CustomerResponse>> response = new ApiResponse<>();
        response.setResult(customerService.searchCustomer(keyword));
        return response;
    }

    @GetMapping("phone/{phone}")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<CustomerResponse> getCustomerByPhone(@PathVariable String phone) {
        ApiResponse<CustomerResponse> response = new ApiResponse<>();
        response.setResult(customerService.getCustomerByPhone(phone));
        return response;
    }

    @GetMapping("/by-points")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng','Nhân viên bán hàng')")
    public ApiResponse<List<CustomerResponse>> getCustomersByPoints(
            @RequestParam(value = "min", required = false) Integer min,
            @RequestParam(value = "max", required = false) Integer max,
            @RequestParam(value = "sort", required = false, defaultValue = "desc") String sort
    ) {
        ApiResponse<List<CustomerResponse>> response = new ApiResponse<>();
        response.setResult(customerService.getCustomersByPoints(min, max, sort));
        return response;
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('Quản trị viên','Chủ cửa hàng')")
    public ApiResponse<String> toggleCustomerStatus(@PathVariable UUID id) {
        customerService.toggleCustomerStatus(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Cập nhật trạng thái khách hàng thành công");
        return response;
    }
}
