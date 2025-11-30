package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.response.NotificationResponse;
import com.g127.snapbuy.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(Notification notification);
}
