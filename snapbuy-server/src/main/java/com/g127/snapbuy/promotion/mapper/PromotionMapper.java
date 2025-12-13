package com.g127.snapbuy.promotion.mapper;

import com.g127.snapbuy.promotion.dto.request.PromotionCreateRequest;
import com.g127.snapbuy.promotion.dto.request.PromotionUpdateRequest;
import com.g127.snapbuy.promotion.dto.response.PromotionResponse;
import com.g127.snapbuy.product.entity.Product;
import com.g127.snapbuy.promotion.entity.Promotion;
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
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Promotion entity, PromotionUpdateRequest request);

    @Mapping(target = "productIds", expression = "java(mapProductIds(entity.getProducts()))")
    PromotionResponse toResponse(Promotion entity);

    default List<UUID> mapProductIds(Set<Product> products) {
        if (products == null) return List.of();
        return products.stream().map(Product::getProductId).collect(Collectors.toList());
    }
}






