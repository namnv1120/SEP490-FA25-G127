package com.g127.snapbuy.mapper;

import com.g127.snapbuy.dto.UserDto;
import com.g127.snapbuy.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Map từ DTO -> Entity
    @Mapping(target = "userRoles", ignore = true)
    User toEntity(UserDto dto);

    // Map từ Entity -> DTO
    @Mapping(target = "id", expression = "java(user.getUserId() != null ? user.getUserId().toString() : null)")
    @Mapping(target = "roles", expression = "java(user.getUserRoles() != null ? " +
            "user.getUserRoles().stream().map(ur -> ur.getRole().getRoleName()).toList() : java.util.List.of())")
    @Mapping(target = "permissions", ignore = true)
    UserDto toDto(User user);

    // Update entity từ DTO (ignore roles vì cần xử lý bằng service)
    @Mapping(target = "userRoles", ignore = true)
    void updateUser(@MappingTarget User user, UserDto dto);
}
