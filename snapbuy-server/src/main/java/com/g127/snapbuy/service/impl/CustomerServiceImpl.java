package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.request.CustomerCreateRequest;
import com.g127.snapbuy.dto.request.CustomerUpdateRequest;
import com.g127.snapbuy.dto.response.CustomerResponse;
import com.g127.snapbuy.entity.Customer;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.mapper.CustomerMapper;
import com.g127.snapbuy.repository.CustomerRepository;
import com.g127.snapbuy.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private static final BigDecimal EARN_DIVISOR = BigDecimal.valueOf(500);
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Override
    public CustomerResponse createCustomer(CustomerCreateRequest request) {
        // Check if phone already exists (regardless of active status)
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String phone = request.getPhone().trim();
            Customer existingCustomer = customerRepository.getCustomerByPhone(phone);
            if (existingCustomer != null) {
                throw new AppException(ErrorCode.PHONE_EXISTED);
            }
        }

        Customer customer = customerMapper.toEntity(request);
        customer.setCreatedDate(LocalDateTime.now());
        customer.setUpdatedDate(LocalDateTime.now());
        customer.setPoints(0);

        String code = generateCustomerCode();
        customer.setCustomerCode(code);

        return customerMapper.toResponse(customerRepository.save(customer));
    }

    private synchronized String generateCustomerCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));

        long countToday = customerRepository.countByCreatedDateBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().atTime(23, 59, 59)
        );

        long nextNumber = countToday + 1;

        return "CUS" + datePart + String.format("%03d", nextNumber);
    }

    @Override
    public CustomerResponse getCustomerById(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        return customerMapper.toResponse(customer);
    }

    @Override
    public List<CustomerResponse> getAllCustomers() {
        List<Customer> customers = customerRepository.findAll();
        return customers.stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponse updateCustomer(UUID id, CustomerUpdateRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        
        // Check if phone is being updated and if it already exists for another customer
        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            String newPhone = request.getPhone().trim();
            Customer existingCustomer = customerRepository.getCustomerByPhone(newPhone);
            if (existingCustomer != null && !existingCustomer.getCustomerId().equals(id)) {
                throw new AppException(ErrorCode.PHONE_EXISTED);
            }
        }
        
        customerMapper.updateFromDto(request, customer);
        customer.setUpdatedDate(LocalDateTime.now());
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    public void deleteCustomer(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        customerRepository.delete(customer);
    }

    @Override
    public List<CustomerResponse> searchCustomer(String keyword) {
        var customers = customerRepository.searchByKeyword(keyword);
        return customers.stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponse getCustomerByPhone(String phone) {
        Customer customer = customerRepository.getCustomerByPhone(phone);
        return customerMapper.toResponse(customer);
    }

    // ================= User Points Management =================

    @Override
    public int normalizeRedeem(int requestedUsePoints, int currentPoints, BigDecimal payableBeforeRedeem) {
        int req = Math.max(0, requestedUsePoints);
        int capByMoney = payableBeforeRedeem.setScale(0, RoundingMode.FLOOR).intValue();
        return Math.min(req, Math.min(currentPoints, capByMoney));
    }

    @Override
    public int earnFromPayable(BigDecimal payableAfterRedeem) {
        if (payableAfterRedeem == null || payableAfterRedeem.signum() <= 0) return 0;
        return payableAfterRedeem.divide(EARN_DIVISOR, 0, RoundingMode.FLOOR).intValue();
    }

    @Override
    public int getPoints(UUID customerId) {
        Customer c = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        return c.getPoints() == null ? 0 : c.getPoints();
    }

    @Override
    public int adjustPoints(UUID customerId, int delta) {
        Customer c = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        int cur = c.getPoints() == null ? 0 : c.getPoints();
        long next = (long) cur + delta;
        if (next < 0) next = 0;
        if (next > Integer.MAX_VALUE) next = Integer.MAX_VALUE;
        c.setPoints((int) next);
        c.setUpdatedDate(LocalDateTime.now());
        customerRepository.save(c);
        return c.getPoints();
    }

    @Override
    public List<CustomerResponse> getCustomersByPoints(Integer min, Integer max, String sort) {
        int from = (min == null) ? 0 : min;
        int to = (max == null) ? Integer.MAX_VALUE : max;
        Sort.Direction dir = ("asc".equalsIgnoreCase(sort)) ? Sort.Direction.ASC : Sort.Direction.DESC;

        List<Customer> customers = customerRepository.findByPointsBetween(from, to, Sort.by(dir, "points"));

        return customers.stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void toggleCustomerStatus(UUID id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        
        // Toggle status (default to true if null)
        boolean currentStatus = customer.getActive() != null ? customer.getActive() : true;
        customer.setActive(!currentStatus);
        customer.setUpdatedDate(LocalDateTime.now());
        
        customerRepository.save(customer);
    }
}