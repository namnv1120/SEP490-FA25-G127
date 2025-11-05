package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.response.InventoryTransactionResponse;
import com.g127.snapbuy.entity.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryTransactionMapper {

    @Mapping(target = "productId", expression = "java(entity.getProduct() != null ? entity.getProduct().getProductId() : null)")
    @Mapping(target = "productName", expression = "java(entity.getProduct() != null ? entity.getProduct().getProductName() : null)")
    @Mapping(target = "accountId", expression = "java(entity.getAccount() != null ? entity.getAccount().getAccountId() : null)")
    @Mapping(target = "accountUsername", expression = "java(entity.getAccount() != null ? entity.getAccount().getUsername() : null)")
    InventoryTransactionResponse toResponse(InventoryTransaction entity);
}


