package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.request.CategoryCreateRequest;
import com.g127.snapbuy.dto.request.CategoryUpdateRequest;
import com.g127.snapbuy.dto.response.CategoryResponse;
import com.g127.snapbuy.entity.Category;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    Category toEntity(CategoryCreateRequest request);

    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    void updateEntity(@MappingTarget Category entity, CategoryUpdateRequest request);

    CategoryResponse toResponse(Category entity);
}
