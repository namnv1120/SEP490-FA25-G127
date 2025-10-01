package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.CustomerCreateRequest;
import com.g127.snapbuy.dto.request.CustomerUpdateRequest;
import com.g127.snapbuy.dto.response.CustomerResponse;

import java.util.List;
import java.util.UUID;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerCreateRequest request);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse getCustomerById(UUID id);

    CustomerResponse updateCustomer(UUID id, CustomerUpdateRequest request);

    void deleteCustomer(UUID id);
}
