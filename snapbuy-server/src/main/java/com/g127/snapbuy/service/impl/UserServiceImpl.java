package com.g127.snapbuy.service.impl;

import com.g127.snapbuy.dto.UserDto;
import com.g127.snapbuy.entity.*;
import com.g127.snapbuy.exception.ResourceNotFoundException;
import com.g127.snapbuy.mapper.UserMapper;
import com.g127.snapbuy.repository.*;
import com.g127.snapbuy.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    RoleRepository roleRepository;
    UserRoleRepository userRoleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    @Override
    public UserDto createUser(UserDto userDto) {
        User user = userMapper.toEntity(userDto);
        if (user.getUserId() == null) user.setUserId(UUID.randomUUID());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("USER_EXISTED");
        }

        Role defaultRole = roleRepository.findByRoleName("ROLE_ADMIN")
                .orElseThrow(() -> new ResourceNotFoundException("Default role not found"));

        UserRole ur = new UserRole();
        ur.setUserRoleId(UUID.randomUUID());
        ur.setUser(user);
        ur.setRole(defaultRole);
        ur.setAssignedAt(OffsetDateTime.now());
        userRoleRepository.save(ur);

        return userMapper.toDto(user);
    }

    @Override
    public UserDto getMyInfo() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User u = userRepository.findWithRolesByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDto(u);
    }

    @Override
    @PostAuthorize("returnObject.username == authentication.name")
    public UserDto updateUser(UUID userId, UserDto req) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (req.getFullName()!=null) u.setFullName(req.getFullName());
        if (req.getEmail()!=null) u.setEmail(req.getEmail());
        if (req.getPassword()!=null && !req.getPassword().isBlank())
            u.setPassword(passwordEncoder.encode(req.getPassword()));

        u = userRepository.save(u);
        return userMapper.toDto(u);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(UUID userId) {
        userRepository.deleteById(userId);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> getUsers() {
        log.info("Fetching all users");
        return userRepository.findAll().stream().map(userMapper::toDto).toList();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto getUser(UUID id) {
        return userMapper.toDto(
                userRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"))
        );
    }

    @Override
    public UserDto changePassword(UUID userId, String oldPassword, String newPassword) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(oldPassword, u.getPassword()))
            throw new IllegalStateException("Old password is incorrect");
        u.setPassword(passwordEncoder.encode(newPassword));
        return userMapper.toDto(userRepository.save(u));
    }

    @Override
    public UserDto assignRole(UUID userId, UUID roleId, UUID assignedById) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new ResourceNotFoundException("AssignedBy user not found"));

        UserRole userRole = new UserRole();
        userRole.setUserRoleId(UUID.randomUUID());
        userRole.setUser(user);
        userRole.setRole(role);
        userRole.setAssignedBy(assignedBy);
        userRole.setAssignedAt(java.time.OffsetDateTime.now());

        userRoleRepository.save(userRole);

        return userMapper.toDto(user);
    }

}
