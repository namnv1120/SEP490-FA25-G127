package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.CustomerDto;
import org.springframework.stereotype.Service;

import java.util.List;

public interface CustomerService {
    CustomerDto createCustomer(CustomerDto customerDto);

    List<CustomerDto> getAllCustomers();

    CustomerDto getCustomerById(String id);

    CustomerDto updateCustomer(String id, CustomerDto customerDto);

    void deleteCustomer(String id);
}
