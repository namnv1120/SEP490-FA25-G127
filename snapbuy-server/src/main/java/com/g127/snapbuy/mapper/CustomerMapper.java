package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.request.CustomerCreateRequest;
import com.g127.snapbuy.dto.request.CustomerUpdateRequest;
import com.g127.snapbuy.dto.response.CustomerResponse;
import com.g127.snapbuy.entity.Customer;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "customerCode", ignore = true)
    @Mapping(target = "status", constant = "Active")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Customer toEntity(CustomerCreateRequest request);

    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "customerCode", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromDto(CustomerUpdateRequest request, @MappingTarget Customer customer);

    CustomerResponse toResponse(Customer customer);
}
