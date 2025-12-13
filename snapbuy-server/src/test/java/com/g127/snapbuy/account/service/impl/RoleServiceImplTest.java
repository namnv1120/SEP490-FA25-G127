package com.g127.snapbuy.account.service.impl;

import com.g127.snapbuy.account.dto.request.RoleCreateRequest;
import com.g127.snapbuy.account.dto.request.RolePermissionUpdateRequest;
import com.g127.snapbuy.account.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.account.dto.response.PermissionResponse;
import com.g127.snapbuy.account.dto.response.RoleResponse;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.entity.Permission;
import com.g127.snapbuy.entity.Role;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.repository.AccountRepository;
import com.g127.snapbuy.repository.PermissionRepository;
import com.g127.snapbuy.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
class RoleServiceImplTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RoleServiceImpl roleService;

    private Role testRole;
    private Permission testPermission;
    private UUID roleId;
    private UUID permissionId;

    @BeforeEach
    void setUp() {
        roleId = UUID.randomUUID();
        permissionId = UUID.randomUUID();

        testRole = new Role();
        testRole.setRoleId(roleId);
        testRole.setRoleName("Nhân viên bán hàng");
        testRole.setDescription("Test Role");
        testRole.setActive(true);
        testRole.setCreatedDate(new Date());
        testRole.setPermissions(new HashSet<>());

        testPermission = new Permission();
        testPermission.setPermissionId(permissionId);
        testPermission.setPermissionName("TEST_PERMISSION");
        testPermission.setDescription("Test Permission");
        testPermission.setModule("TEST");
        testPermission.setIsActive(true);
    }

    @Test
    void createRole_Success() {
        // Given
        RoleCreateRequest request = new RoleCreateRequest();
        request.setRoleName("Nhân viên kho");
        request.setDescription("Warehouse Staff");
        request.setActive(true);

        when(roleRepository.existsByRoleNameIgnoreCase(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);

        // When
        RoleResponse result = roleService.createRole(request);

        // Then
        assertNotNull(result);
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void createRole_AdminRole_ThrowsException() {
        // Given
        RoleCreateRequest request = new RoleCreateRequest();
        request.setRoleName("Quản trị viên");

        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> roleService.createRole(request));
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void createRole_DuplicateName_ThrowsException() {
        // Given
        RoleCreateRequest request = new RoleCreateRequest();
        request.setRoleName("Existing Role");

        when(roleRepository.existsByRoleNameIgnoreCase(anyString())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class,
            () -> roleService.createRole(request));
        assertEquals(ErrorCode.NAME_EXISTED, exception.getErrorCode());
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void createRole_WithNullActive_DefaultsToTrue() {
        // Given
        RoleCreateRequest request = new RoleCreateRequest();
        request.setRoleName("New Role");
        request.setActive(null);

        when(roleRepository.existsByRoleNameIgnoreCase(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);

        // When
        RoleResponse result = roleService.createRole(request);

        // Then
        assertNotNull(result);
        verify(roleRepository).save(argThat(r -> Boolean.TRUE.equals(r.getActive())));
    }

    @Test
    void getAllRoles_Success() {
        // Given
        List<Role> roles = Arrays.asList(testRole);
        when(roleRepository.findAll()).thenReturn(roles);

        // When
        List<RoleResponse> result = roleService.getAllRoles(Optional.empty());

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getRoleById_Success() {
        // Given
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When
        RoleResponse result = roleService.getRoleById(roleId);

        // Then
        assertNotNull(result);
        assertEquals(roleId.toString(), result.getId());
    }

    @Test
    void getRoleById_NotFound_ThrowsException() {
        // Given
        when(roleRepository.findById(roleId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class,
            () -> roleService.getRoleById(roleId));
    }

    @Test
    void updateRole_AsAdmin_Success() {
        // Given
        setupAdminSecurityContext();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("Updated Role");
        request.setDescription("Updated Description");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(roleRepository.findByRoleNameIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);

        // When
        RoleResponse result = roleService.updateRole(roleId, request);

        // Then
        assertNotNull(result);
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void updateRole_AdminRole_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        Role adminRole = new Role();
        adminRole.setRoleId(roleId);
        adminRole.setRoleName("Quản trị viên");

        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("New Name");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(adminRole));

        // When & Then
        assertThrows(IllegalStateException.class,
            () -> roleService.updateRole(roleId, request));
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void updateRole_AsNonAdmin_ThrowsException() {
        // Given
        setupNonAdminSecurityContext();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("Updated Role");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> roleService.updateRole(roleId, request));
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void updateRole_ToAdminName_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("Quản trị viên");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        assertThrows(IllegalArgumentException.class,
            () -> roleService.updateRole(roleId, request));
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void deleteRole_Success() {
        // Given
        setupAdminSecurityContext();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(accountRepository.countAccountsByRoleId(roleId)).thenReturn(0L);

        // When
        roleService.deleteRole(roleId);

        // Then
        verify(roleRepository).deleteById(roleId);
    }

    @Test
    void deleteRole_AdminRole_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        Role adminRole = new Role();
        adminRole.setRoleId(roleId);
        adminRole.setRoleName("Quản trị viên");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(adminRole));

        // When & Then
        assertThrows(IllegalStateException.class,
            () -> roleService.deleteRole(roleId));
        verify(roleRepository, never()).deleteById(any());
    }

    @Test
    void deleteRole_CurrentUserRole_ThrowsException() {
        // Given
        setupSecurityContextWithRole("Nhân viên bán hàng");
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        assertThrows(IllegalStateException.class,
            () -> roleService.deleteRole(roleId));
        verify(roleRepository, never()).deleteById(any());
    }

    @Test
    void deleteRole_InUse_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(accountRepository.countAccountsByRoleId(roleId)).thenReturn(5L);

        // When & Then
        assertThrows(IllegalStateException.class,
            () -> roleService.deleteRole(roleId));
        verify(roleRepository, never()).deleteById(any());
    }

    @Test
    void listPermissions_Success() {
        // Given
        testRole.getPermissions().add(testPermission);
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When
        List<PermissionResponse> result = roleService.listPermissions(roleId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void addPermission_Success() {
        // Given
        setupAdminSecurityContext();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);

        // When
        roleService.addPermission(roleId, permissionId);

        // Then
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void addPermission_InactiveRole_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        testRole.setActive(false);
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        assertThrows(IllegalStateException.class,
            () -> roleService.addPermission(roleId, permissionId));
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void addPermission_InactivePermission_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        testPermission.setIsActive(false);
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));

        // When & Then
        assertThrows(IllegalStateException.class,
            () -> roleService.addPermission(roleId, permissionId));
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void removePermission_Success() {
        // Given
        setupAdminSecurityContext();
        testRole.getPermissions().add(testPermission);
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);

        // When
        roleService.removePermission(roleId, permissionId);

        // Then
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void setPermissions_Success() {
        // Given
        setupAdminSecurityContext();
        RolePermissionUpdateRequest request = new RolePermissionUpdateRequest();
        request.setPermissionIds(Arrays.asList(permissionId));

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findById(permissionId)).thenReturn(Optional.of(testPermission));
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);

        // When
        RoleResponse result = roleService.setPermissions(roleId, request);

        // Then
        assertNotNull(result);
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void setPermissions_PermissionNotFound_ThrowsException() {
        // Given
        setupAdminSecurityContext();
        RolePermissionUpdateRequest request = new RolePermissionUpdateRequest();
        request.setPermissionIds(Arrays.asList(permissionId));

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(permissionRepository.findById(permissionId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class,
            () -> roleService.setPermissions(roleId, request));
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void toggleRoleStatus_Success() {
        // Given
        setupAdminSecurityContext();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);

        // When
        RoleResponse result = roleService.toggleRoleStatus(roleId);

        // Then
        assertNotNull(result);
        verify(roleRepository).save(argThat(role -> !role.getActive()));
    }

    @Test
    void toggleRoleStatus_CurrentUserRole_ThrowsException() {
        // Given
        setupSecurityContextWithRole("Nhân viên bán hàng");
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        assertThrows(IllegalStateException.class,
            () -> roleService.toggleRoleStatus(roleId));
        verify(roleRepository, never()).save(any(Role.class));
    }

    @Test
    void searchRolesPaged_Success() {
        // Given
        List<Role> roles = Arrays.asList(testRole);
        Page<Role> page = new PageImpl<>(roles, PageRequest.of(0, 10), 1);

        when(roleRepository.searchRolesPage(anyString(), any(), any())).thenReturn(page);

        // When
        PageResponse<RoleResponse> result = roleService.searchRolesPaged("test", true, PageRequest.of(0, 10));

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1, result.getTotalElements());
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

    private void setupSecurityContextWithRole(String roleName) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + roleName)
        );
        lenient().when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }
}
