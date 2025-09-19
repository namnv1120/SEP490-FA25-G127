package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.CustomerDto;
import com.g127.snapbuy.entity.Customer;
import com.g127.snapbuy.exception.ResourceNotFoundException;
import com.g127.snapbuy.mapper.CustomerMapper;
import com.g127.snapbuy.repository.CustomerRepository;
import com.g127.snapbuy.service.CustomerService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@Service
public class CustomerServiceImpl implements CustomerService {
    private CustomerRepository customerRepository;
    private CustomerMapper customerMapper;

    @Override
    public CustomerDto createCustomer(CustomerDto customerDto) {
        Customer customer = customerMapper.toEntity(customerDto);
        return customerMapper.toDto(customerRepository.save(customer));
    }

    @Override
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(customerMapper::toDto)
                .toList();
    }

    @Override
    public CustomerDto getCustomerById(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return customerMapper.toDto(customer);
    }

    @Override
    public CustomerDto updateCustomer(UUID id, CustomerDto customerDto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customer.setCustomerCode(customerDto.getCustomerCode());
        customer.setFullName(customerDto.getFullName());
        customer.setEmail(customerDto.getEmail());
        customer.setPhone(customerDto.getPhone());
        customer.setAddress(customerDto.getAddress());
        customer.setCity(customerDto.getCity());
        customer.setDistrict(customerDto.getDistrict());
        customer.setWard(customerDto.getWard());
        customer.setDateOfBirth(customerDto.getDateOfBirth());
        customer.setGender(customerDto.getGender());
        customer.setCustomerType(customerDto.getCustomerType());
        customer.setTaxCode(customerDto.getTaxCode());
        customer.setCreditLimit(customerDto.getCreditLimit());
        customer.setStatus(customerDto.getStatus());
        customer.setUpdatedAt(LocalDateTime.now());
        return customerMapper.toDto(customerRepository.save(customer));
    }


    @Override
    public void deleteCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customerRepository.deleteById(id);
    }
}
