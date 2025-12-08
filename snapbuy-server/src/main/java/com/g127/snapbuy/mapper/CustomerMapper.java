package com.g127.snapbuy.mapper;

import com.g127.snapbuy.customer.dto.request.CustomerCreateRequest;
import com.g127.snapbuy.customer.dto.request.CustomerUpdateRequest;
import com.g127.snapbuy.customer.dto.response.CustomerResponse;
import com.g127.snapbuy.entity.Customer;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "customerCode", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    Customer toEntity(CustomerCreateRequest request);

    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "customerCode", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    void updateFromDto(CustomerUpdateRequest request, @MappingTarget Customer customer);

    @Mapping(source = "points", target = "points")
    @Mapping(source = "active", target = "active", defaultValue = "true")
    CustomerResponse toResponse(Customer customer);
}

