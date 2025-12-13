package com.g127.snapbuy.product.mapper;

import com.g127.snapbuy.product.dto.request.ProductPriceCreateRequest;
import com.g127.snapbuy.product.dto.request.ProductPriceUpdateRequest;
import com.g127.snapbuy.product.dto.response.ProductPriceResponse;
import com.g127.snapbuy.product.entity.ProductPrice;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductPriceMapper {

    @Mapping(source = "product.productId", target = "productId")
    @Mapping(source = "product.productCode", target = "productCode")
    @Mapping(source = "product.productName", target = "productName")
    ProductPriceResponse toResponse(ProductPrice entity);

    @Mapping(target = "priceId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    ProductPrice toEntity(ProductPriceCreateRequest request);

    @Mapping(target = "priceId", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateEntity(@MappingTarget ProductPrice entity, ProductPriceUpdateRequest request);
}
