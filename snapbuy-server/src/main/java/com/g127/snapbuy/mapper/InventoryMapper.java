package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.request.InventoryCreateRequest;
import com.g127.snapbuy.dto.request.InventoryUpdateRequest;
import com.g127.snapbuy.dto.response.InventoryResponse;
import com.g127.snapbuy.entity.Inventory;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InventoryMapper {

    @Mapping(target = "inventoryId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "lastUpdated", ignore = true)
    Inventory toEntity(InventoryCreateRequest request);

    @Mapping(target = "productId", source = "product.productId")
    @Mapping(target = "productName", source = "product.productName")
    InventoryResponse toResponse(Inventory entity);

    void updateEntity(InventoryUpdateRequest request, @MappingTarget Inventory inventory);
}
