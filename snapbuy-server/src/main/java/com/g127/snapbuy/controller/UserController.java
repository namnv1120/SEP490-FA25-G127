package com.g127.snapbuy.controller;

import com.g127.snapbuy.dto.UserDto;
import com.g127.snapbuy.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ===== CREATE (public theo SecurityConfig: POST /api/users) =====
    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        UserDto created = userService.createUser(userDto);
        // Không trả password ra ngoài – nếu muốn thấy, tự set trong mapper/service (không khuyến nghị)
        created.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ===== LIST (cần quyền, ví dụ ADMIN) =====
    @GetMapping
    public ResponseEntity<List<UserDto>> getUsers() {
        return ResponseEntity.ok(userService.getUsers());
    }

    // ===== GET BY ID (cần quyền) =====
    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    // ===== MY-INFO (dựa vào SecurityContext) =====
    @GetMapping("/my-info")
    public ResponseEntity<UserDto> getMyInfo() {
        return ResponseEntity.ok(userService.getMyInfo());
    }

    // ===== UPDATE (PUT /api/users/{id}) – cần Bearer token =====
    @PutMapping("/{userId}")
    public ResponseEntity<UserDto> updateUser(@PathVariable UUID userId, @RequestBody UserDto userDto) {
        UserDto updated = userService.updateUser(userId, userDto);
        updated.setPassword(null);
        return ResponseEntity.ok(updated);
    }

    // ===== DELETE =====
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // ===== ASSIGN ROLE (giữ đúng chữ ký service của bạn) =====
    // POST /api/users/{userId}/assign-role/{roleId}?assignedBy=<uuid>
    @PostMapping("/{userId}/assign-role/{roleId}")
    public ResponseEntity<UserDto> assignRole(
            @PathVariable UUID userId,
            @PathVariable UUID roleId,
            @RequestParam UUID assignedBy
    ) {
        return ResponseEntity.ok(userService.assignRole(userId, roleId, assignedBy));
    }

    // ===== CHANGE PASSWORD =====
    // POST /api/users/{userId}/change-password?oldPassword=...&newPassword=...
    @PostMapping("/{userId}/change-password")
    public ResponseEntity<UserDto> changePassword(
            @PathVariable UUID userId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword
    ) {
        UserDto changed = userService.changePassword(userId, oldPassword, newPassword);
        changed.setPassword(null);
        return ResponseEntity.ok(changed);
    }

}
