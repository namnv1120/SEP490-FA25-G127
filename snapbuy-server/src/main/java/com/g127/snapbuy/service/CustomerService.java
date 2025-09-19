package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.CustomerDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

public interface CustomerService {
    CustomerDto createCustomer(CustomerDto customerDto);

    List<CustomerDto> getAllCustomers();

    CustomerDto getCustomerById(UUID id);

    CustomerDto updateCustomer(UUID id, CustomerDto customerDto);

    void deleteCustomer(UUID id);
}
