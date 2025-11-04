package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.request.PromotionCreateRequest;
import com.g127.snapbuy.dto.request.PromotionUpdateRequest;
import com.g127.snapbuy.dto.response.PromotionResponse;
import com.g127.snapbuy.entity.Product;
import com.g127.snapbuy.entity.Promotion;
import org.mapstruct.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface PromotionMapper {

    @Mapping(target = "promotionId", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "active", ignore = true)
    Promotion toEntity(PromotionCreateRequest request);

    @Mapping(target = "promotionId", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateEntity(@MappingTarget Promotion entity, PromotionUpdateRequest request);

    @Mapping(target = "productIds", expression = "java(mapProductIds(entity.getProducts()))")
    PromotionResponse toResponse(Promotion entity);

    default List<UUID> mapProductIds(Set<Product> products) {
        if (products == null) return List.of();
        return products.stream().map(Product::getProductId).collect(Collectors.toList());
    }
}




