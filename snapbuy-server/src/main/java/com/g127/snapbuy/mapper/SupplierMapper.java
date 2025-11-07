package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.request.SupplierCreateRequest;
import com.g127.snapbuy.dto.request.SupplierUpdateRequest;
import com.g127.snapbuy.dto.response.SupplierResponse;
import com.g127.snapbuy.entity.Supplier;
import org.mapstruct.*;
import org.springframework.data.domain.Page;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "supplierId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    Supplier toEntity(SupplierCreateRequest req);

    @Mapping(target = "supplierId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(@MappingTarget Supplier entity, SupplierUpdateRequest req);

    SupplierResponse toResponse(Supplier entity);

}
