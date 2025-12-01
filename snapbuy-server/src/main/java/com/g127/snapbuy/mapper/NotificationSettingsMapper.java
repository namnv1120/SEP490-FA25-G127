package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.request.NotificationSettingsUpdateRequest;
import com.g127.snapbuy.dto.response.NotificationSettingsResponse;
import com.g127.snapbuy.entity.NotificationSettings;
import org.mapstruct.*;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface NotificationSettingsMapper {

    NotificationSettingsResponse toResponse(NotificationSettings entity);


    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "settingsId", ignore = true)
    @Mapping(target = "accountId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "updatedDate", ignore = true)
    void updateEntity(@MappingTarget NotificationSettings entity, NotificationSettingsUpdateRequest request);
}

