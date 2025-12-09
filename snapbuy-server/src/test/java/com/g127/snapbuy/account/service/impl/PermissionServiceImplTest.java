package com.g127.snapbuy.account.service.impl;

import com.g127.snapbuy.account.dto.request.PermissionCreateRequest;
import com.g127.snapbuy.account.dto.request.PermissionUpdateRequest;
import com.g127.snapbuy.account.dto.response.PermissionResponse;
import com.g127.snapbuy.entity.Permission;
import com.g127.snapbuy.exception.AppException;
import com.g127.snapbuy.exception.ErrorCode;
import com.g127.snapbuy.repository.PermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PermissionServiceImplTest {

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PermissionServiceImpl permissionService;

    private Permission testPermission;
    private UUID permissionId;

    @BeforeEach
    void setUp() {
        permissionId = UUID.randomUUID();

        testPermission = new Permission();
        testPermission.setPermissionId(permissionId);
        testPermission.setPermissionName("TEST_PERMISSION");
        testPermission.setDescription("Test Permission Description");
        testPermission.setModule("TEST_MODULE");
        testPermission.setIsActive(true);
    }

    @Test
    void createPermission_Success() {
        // Given
        PermissionCreateRequest request = new PermissionCreateRequest();
        request.setPermissionName("NEW_PERMISSION");
        request.setDescription("New Permission");
        request.setModule("NEW_MODULE");
        request.setIsActive(true);

        when(permissionRepository.existsByPermissionNameIgnoreCase(anyString())).thenReturn(false);
        when(permissionRepository.save(any(Permission.class))).thenReturn(testPermission);

        // When
        PermissionResponse result = permissionService.createPermission(request);

        // Then
        assertNotNull(result);
        verify(permissionRepository).save(any(Permission.class));
    }

    @Test
    void createPermission_NameExists_ThrowsException() {
        // Given
        PermissionCreateRequest request = new PermissionCreateRequest();
        request.setPermissionName("EXISTING_PERMISSION");

        when(permissionRepository.existsByPermissionNameIgnoreCase(anyString())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> permissionService.createPermission(request));
        assertEquals(ErrorCode.NAME_EXISTED, exception.getErrorCode());
        verify(permissionRepository, never()).save(any(Permission.class));
    }

    @Test
    void createPermission_WithNullIsActive_DefaultsToTrue() {
        // Given
        PermissionCreateRequest request = new PermissionCreateRequest();
        request.setPermissionName("NEW_PERMISSION");
        request.setDescription("New Permission");
        request.setModule("NEW_MODULE");
        request.setIsActive(null);

        when(permissionRepository.existsByPermissionNameIgnoreCase(anyString())).thenReturn(false);
        when(permissionRepository.save(any(Permission.class))).thenReturn(testPermission);

        // When
        PermissionResponse result = permissionService.createPermission(request);

        // Then
        assertNotNull(result);
        verify(permissionRepository).save(argThat(p -> Boolean.TRUE.equals(p.getIsActive())));
    }

    @Test
    void getAllPermissions_NoFilter_ReturnsActiveOnly() {
        // Given
        Permission inactivePermission = new Permission();
        inactivePermission.setPermissionId(UUID.randomUUID());
        inactivePermission.setPermissionName("INACTIVE_PERMISSION");
        inactivePermission.setIsActive(false);

        List<Permission> permissions = Arrays.asList(testPermission, inactivePermission);
        when(permissionRepository.findAll()).thenReturn(permissions);

        // When
        List<PermissionResponse> result = permissionService.getAllPermissions(Optional.empty());

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAllPermissions_WithActiveFilter_ReturnsFiltered() {
        // Given
        Permission inactivePermission = new Permission();
        inactivePermission.setPermissionId(UUID.randomUUID());
        inactivePermission.setPermissionName("INACTIVE_PERMISSION");
        inactivePermission.setIsActive(false);

        List<Permission> permissions = Arrays.asList(testPermission, inactivePermission);
        when(permissionRepository.findAll()).thenReturn(permissions);

        // When
        List<PermissionResponse> result = permissionService.getAllPermissions(Optional.of(true));

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAllPermissions_WithInactiveFilter_ReturnsInactive() {
        // Given
        Permission inactivePermission = new Permission();
        inactivePermission.setPermissionId(UUID.randomUUID());
        inactivePermission.setPermissionName("INACTIVE_PERMISSION");
        inactivePermission.setIsActive(false);

        List<Permission> permissions = Arrays.asList(testPermission, inactivePermission);
        when(permissionRepository.findAll()).thenReturn(permissions);

        // When
        List<PermissionResponse> result = permissionService.getAllPermissions(Optional.of(false));

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getPermissionById_Success() {
        // Given
        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));

        // When
        PermissionResponse result = permissionService.getPermissionById(permissionId);

        // Then
        assertNotNull(result);
        assertEquals(permissionId.toString(), result.getId());
        assertEquals("TEST_PERMISSION", result.getName());
    }

    @Test
    void getPermissionById_NotFound_ThrowsException() {
        // Given
        when(permissionRepository.findById(permissionId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class,
            () -> permissionService.getPermissionById(permissionId));
    }

    @Test
    void updatePermission_AsAdmin_Success() {
        // Given
        setupAdminSecurityContext();
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setPermissionName("UPDATED_PERMISSION");
        request.setDescription("Updated Description");
        request.setModule("UPDATED_MODULE");
        request.setIsActive(false);

        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));
        when(permissionRepository.findByPermissionNameIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(permissionRepository.save(any(Permission.class))).thenReturn(testPermission);

        // When
        PermissionResponse result = permissionService.updatePermission(permissionId, request);

        // Then
        assertNotNull(result);
        verify(permissionRepository).save(any(Permission.class));
    }

    @Test
    void updatePermission_AsNonAdmin_UpdateName_ThrowsException() {
        // Given
        setupNonAdminSecurityContext();
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setPermissionName("UPDATED_PERMISSION");

        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));

        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> permissionService.updatePermission(permissionId, request));
        verify(permissionRepository, never()).save(any(Permission.class));
    }

    @Test
    void updatePermission_AsNonAdmin_UpdateDescription_ThrowsException() {
        // Given
        setupNonAdminSecurityContext();
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setDescription("Updated Description");

        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));

        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> permissionService.updatePermission(permissionId, request));
        verify(permissionRepository, never()).save(any(Permission.class));
    }

    @Test
    void updatePermission_AsNonAdmin_UpdateModule_ThrowsException() {
        // Given
        setupNonAdminSecurityContext();
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setModule("UPDATED_MODULE");

        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));

        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> permissionService.updatePermission(permissionId, request));
        verify(permissionRepository, never()).save(any(Permission.class));
    }

    @Test
    void updatePermission_AsNonAdmin_UpdateIsActive_Success() {
        // Given
        setupNonAdminSecurityContext();
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setIsActive(false);

        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));
        when(permissionRepository.save(any(Permission.class))).thenReturn(testPermission);

        // When
        PermissionResponse result = permissionService.updatePermission(permissionId, request);

        // Then
        assertNotNull(result);
        verify(permissionRepository).save(any(Permission.class));
    }

    @Test
    void updatePermission_DuplicateName_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setPermissionName("DUPLICATE_PERMISSION");

        Permission otherPermission = new Permission();
        otherPermission.setPermissionId(UUID.randomUUID());
        otherPermission.setPermissionName("DUPLICATE_PERMISSION");

        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));
        when(permissionRepository.findByPermissionNameIgnoreCase(anyString()))
            .thenReturn(Optional.of(otherPermission));

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> permissionService.updatePermission(permissionId, request));
        assertEquals(ErrorCode.NAME_EXISTED, exception.getErrorCode());
        verify(permissionRepository, never()).save(any(Permission.class));
    }

    @Test
    void updatePermission_NotFound_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        PermissionUpdateRequest request = new PermissionUpdateRequest();
        request.setPermissionName("UPDATED_PERMISSION");

        when(permissionRepository.findById(permissionId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class,
            () -> permissionService.updatePermission(permissionId, request));
        verify(permissionRepository, never()).save(any(Permission.class));
    }

    @Test
    void deletePermission_Success() {
        // Given
        doNothing().when(permissionRepository).deleteById(permissionId);

        // When
        permissionService.deletePermission(permissionId);

        // Then
        verify(permissionRepository).deleteById(permissionId);
    }

    // Helper methods
    private void setupAdminSecurityContext() {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_Quản trị viên")
        );
        lenient().when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    private void setupNonAdminSecurityContext() {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_Chủ cửa hàng")
        );
        lenient().when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }
}
