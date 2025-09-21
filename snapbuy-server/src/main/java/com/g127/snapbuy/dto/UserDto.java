package com.g127.snapbuy.dto;

import lombok.*;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    String id;
    String username;
    String password;
    String email;
    String fullName;
    Boolean isActive;
    List<String> roles;
    List<String> permissions;
}