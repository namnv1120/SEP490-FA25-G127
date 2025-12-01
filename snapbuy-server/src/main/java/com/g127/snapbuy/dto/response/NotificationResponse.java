package com.g127.snapbuy.dto.response;

import com.g127.snapbuy.entity.Notification.NotificationType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private UUID id;
    private NotificationType type;
    private String message;
    private String description;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private UUID referenceId;
}
