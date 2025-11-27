package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.request.CustomerCreateRequest;
import com.g127.snapbuy.dto.request.CustomerUpdateRequest;
import com.g127.snapbuy.dto.response.CustomerResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerCreateRequest request);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse getCustomerById(UUID id);

    CustomerResponse updateCustomer(UUID id, CustomerUpdateRequest request);

    void deleteCustomer(UUID id);

    List<CustomerResponse> searchCustomer(String keyword);

    CustomerResponse getCustomerByPhone(String phone);

    int normalizeRedeem(int requestedUsePoints, int currentPoints, BigDecimal payableBeforeRedeem);

    // Tính điểm được cộng theo quy tắc hiện tại: floor(payableAfterRedeem / 500)
    int earnFromPayable(BigDecimal payableAfterRedeem);

    int getPoints(UUID customerId);

    int adjustPoints(UUID customerId, int delta);

     List<CustomerResponse> getCustomersByPoints(Integer min, Integer max, String sort);

    void toggleCustomerStatus(UUID id);
}
