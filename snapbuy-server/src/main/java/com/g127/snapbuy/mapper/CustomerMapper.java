package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.CustomerDto;
import com.g127.snapbuy.entity.Customer;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerDto toDto(Customer customer);
    Customer toEntity(CustomerDto customerDto);
}
