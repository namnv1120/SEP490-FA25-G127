package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.ApiResponse;
import com.g127.snapbuy.dto.request.CustomerCreateRequest;
import com.g127.snapbuy.dto.request.CustomerUpdateRequest;
import com.g127.snapbuy.dto.response.CustomerResponse;
import com.g127.snapbuy.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ApiResponse<CustomerResponse> createCustomer(@RequestBody @Valid CustomerCreateRequest request) {
        ApiResponse<CustomerResponse> response = new ApiResponse<>();
        response.setResult(customerService.createCustomer(request));
        return response;
    }

    @GetMapping
    public ApiResponse<List<CustomerResponse>> getAllCustomers() {
        ApiResponse<List<CustomerResponse>> response = new ApiResponse<>();
        response.setResult(customerService.getAllCustomers());
        return response;
    }

    @GetMapping("{id}")
    public ApiResponse<CustomerResponse> getCustomerById(@PathVariable("id") UUID id) {
        ApiResponse<CustomerResponse> response = new ApiResponse<>();
        response.setResult(customerService.getCustomerById(id));
        return response;
    }

    @PutMapping("{id}")
    public ApiResponse<CustomerResponse> updateCustomer(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CustomerUpdateRequest request) {
        ApiResponse<CustomerResponse> response = new ApiResponse<>();
        response.setResult(customerService.updateCustomer(id, request));
        return response;
    }

    @DeleteMapping("{id}")
    public ApiResponse<String> deleteCustomer(@PathVariable("id") UUID id) {
        customerService.deleteCustomer(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Khách hàng đã được xoá");
        return response;
    }

    @GetMapping("/search")
    public ApiResponse<List<CustomerResponse>> searchCustomer(@RequestParam("keyword") String keyword) {
        ApiResponse<List<CustomerResponse>> response = new ApiResponse<>();
        response.setResult(customerService.searchCustomer(keyword));
        return response;
    }

    @GetMapping("phone/{phone}")
    public ApiResponse<CustomerResponse> getCustomerByPhone(@PathVariable String phone) {
        ApiResponse<CustomerResponse> response = new ApiResponse<>();
        response.setResult(customerService.getCustomerByPhone(phone));
        return response;
    }

    @GetMapping("/by-points")
    public ApiResponse<List<CustomerResponse>> getCustomersByPoints(
            @RequestParam(value = "min", required = false) Integer min,
            @RequestParam(value = "max", required = false) Integer max,
            @RequestParam(value = "sort", required = false, defaultValue = "desc") String sort
    ) {
        ApiResponse<List<CustomerResponse>> response = new ApiResponse<>();
        response.setResult(customerService.getCustomersByPoints(min, max, sort));
        return response;
    }
}
