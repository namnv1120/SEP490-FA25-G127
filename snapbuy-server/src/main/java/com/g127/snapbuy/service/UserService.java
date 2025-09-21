package com.g127.snapbuy.service;

import com.g127.snapbuy.dto.UserDto;
import java.util.List;
import java.util.UUID;

public interface UserService {
    UserDto createUser(UserDto userDto);
    UserDto getMyInfo();
    UserDto updateUser(UUID userId, UserDto userDto);
    void deleteUser(UUID userId);
    List<UserDto> getUsers();
    UserDto getUser(UUID id);
    UserDto changePassword(UUID userId, String oldPassword, String newPassword);
    UserDto assignRole(UUID userId, UUID roleId, UUID assignedBy);
}
