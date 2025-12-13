package com.g127.snapbuy.notification.mapper;

import com.g127.snapbuy.notification.dto.response.NotificationResponse;
import com.g127.snapbuy.notification.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationResponse toResponse(Notification notification);
}
