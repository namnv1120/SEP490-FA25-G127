package com.g127.snapbuy.account.service.impl;

import com.g127.snapbuy.account.dto.request.RoleCreateRequest;
import com.g127.snapbuy.account.dto.request.RoleUpdateRequest;
import com.g127.snapbuy.account.dto.response.RoleResponse;
import com.g127.snapbuy.account.entity.Role;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.account.repository.RoleRepository;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.common.exception.ErrorCode;
import com.g127.snapbuy.common.response.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private AccountRepository accountRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private RoleServiceImpl roleService;

    private Role testRole;
    private Role adminRole;
    private Role ownerRole;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setRoleId(UUID.randomUUID());
        testRole.setRoleName("Nhân viên");
        testRole.setDescription("Staff role");
        testRole.setActive(true);
        testRole.setCreatedDate(new Date());

        adminRole = new Role();
        adminRole.setRoleId(UUID.randomUUID());
        adminRole.setRoleName("Quản trị viên");
        adminRole.setDescription("Admin role");
        adminRole.setActive(true);
        adminRole.setCreatedDate(new Date());

        ownerRole = new Role();
        ownerRole.setRoleId(UUID.randomUUID());
        ownerRole.setRoleName("Chủ cửa hàng");
        ownerRole.setDescription("Owner role");
        ownerRole.setActive(true);
        ownerRole.setCreatedDate(new Date());
    }

    private void mockAuthentication(String roleName) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + roleName)
        );
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createRole_Success() {
        // Given
        RoleCreateRequest request = new RoleCreateRequest();
        request.setRoleName("Quản lý");
        request.setDescription("Manager role");
        request.setActive(true);

        when(roleRepository.existsByRoleNameIgnoreCase(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> {
            Role role = invocation.getArgument(0);
            role.setRoleId(UUID.randomUUID());
            return role;
        });

        // When
        RoleResponse response = roleService.createRole(request);

        // Then
        assertNotNull(response);
        assertEquals("Quản lý", response.getRoleName());
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void createRole_AdminRoleName_ThrowsException() {
        // Given
        RoleCreateRequest request = new RoleCreateRequest();
        request.setRoleName("Quản trị viên");

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> roleService.createRole(request));

        assertTrue(exception.getMessage().contains("Không thể tạo vai trò 'Quản trị viên'"));
        verify(roleRepository, never()).save(any());
    }

    @Test
    void createRole_DuplicateName_ThrowsException() {
        // Given
        RoleCreateRequest request = new RoleCreateRequest();
        request.setRoleName("Nhân viên");
        when(roleRepository.existsByRoleNameIgnoreCase(anyString())).thenReturn(true);

        // When & Then
        AppException exception = assertThrows(AppException.class,
                () -> roleService.createRole(request));

        assertEquals(ErrorCode.NAME_EXISTED, exception.getErrorCode());
        verify(roleRepository, never()).save(any());
    }

    @Test
    void createRole_DefaultActiveTrue() {
        // Given
        RoleCreateRequest request = new RoleCreateRequest();
        request.setRoleName("Test Role");
        request.setActive(null); // No active value

        when(roleRepository.existsByRoleNameIgnoreCase(anyString())).thenReturn(false);
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> {
            Role role = invocation.getArgument(0);
            role.setRoleId(UUID.randomUUID());
            return role;
        });

        // When
        RoleResponse response = roleService.createRole(request);

        // Then
        assertTrue(response.getActive());
        verify(roleRepository).save(argThat(role -> role.getActive() == true));
    }

    @Test
    void getAllRoles_ReturnsAllRoles() {
        // Given
        List<Role> roles = Arrays.asList(testRole, adminRole, ownerRole);
        when(roleRepository.findAll()).thenReturn(roles);

        // When
        List<RoleResponse> responses = roleService.getAllRoles(Optional.empty());

        // Then
        assertNotNull(responses);
        assertEquals(3, responses.size());
        verify(roleRepository).findAll();
    }

    @Test
    void getAllRoles_IgnoresActiveFilter() {
        // Given
        List<Role> roles = Arrays.asList(testRole, adminRole);
        when(roleRepository.findAll()).thenReturn(roles);

        // When - activeFilter is ignored in implementation
        List<RoleResponse> responses = roleService.getAllRoles(Optional.of(true));

        // Then
        assertEquals(2, responses.size());
        verify(roleRepository).findAll(); // Still calls findAll()
    }

    @Test
    void getRoleById_Success() {
        // Given
        UUID roleId = testRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When
        RoleResponse response = roleService.getRoleById(roleId);

        // Then
        assertNotNull(response);
        assertEquals(testRole.getRoleName(), response.getRoleName());
        verify(roleRepository).findById(roleId);
    }

    @Test
    void getRoleById_NotFound_ThrowsException() {
        // Given
        UUID roleId = UUID.randomUUID();
        when(roleRepository.findById(roleId)).thenReturn(Optional.empty());

        // When & Then
        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> roleService.getRoleById(roleId));

        assertTrue(exception.getMessage().contains("Không tìm thấy vai trò"));
    }

    @Test
    void updateRole_Success_AsAdmin() {
        // Given
        mockAuthentication("Quản trị viên");
        UUID roleId = testRole.getRoleId();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("Updated Role");
        request.setDescription("Updated description");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(roleRepository.findByRoleNameIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(roleRepository.save(any(Role.class))).thenReturn(testRole);

        // When
        RoleResponse response = roleService.updateRole(roleId, request);

        // Then
        assertNotNull(response);
        verify(roleRepository).save(any(Role.class));
    }

    @Test
    void updateRole_AdminRole_ThrowsException() {
        // Given
        UUID roleId = adminRole.getRoleId();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("New Name");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(adminRole));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.updateRole(roleId, request));

        assertTrue(exception.getMessage().contains("Không thể cập nhật vai trò 'Quản trị viên'"));
    }

    @Test
    void updateRole_OwnerRoleAsOwner_ThrowsException() {
        // Given
        mockAuthentication("Chủ cửa hàng");
        UUID roleId = ownerRole.getRoleId();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("New Name");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(ownerRole));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.updateRole(roleId, request));

        assertTrue(exception.getMessage().contains("Chủ cửa hàng không được phép chỉnh sửa"));
    }

    @Test
    void updateRole_NonAdminChangeName_ThrowsException() {
        // Given
        mockAuthentication("Nhân viên");
        UUID roleId = testRole.getRoleId();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("New Name");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> roleService.updateRole(roleId, request));

        assertTrue(exception.getMessage().contains("Chỉ 'Quản trị viên' mới được đổi tên"));
    }

    @Test
    void updateRole_NonAdminChangeDescription_ThrowsException() {
        // Given
        mockAuthentication("Nhân viên");
        UUID roleId = testRole.getRoleId();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setDescription("New Description");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> roleService.updateRole(roleId, request));

        assertTrue(exception.getMessage().contains("Chỉ 'Quản trị viên' mới được cập nhật mô tả"));
    }

    @Test
    void updateRole_DuplicateName_ThrowsException() {
        // Given
        mockAuthentication("Quản trị viên");
        UUID roleId = testRole.getRoleId();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("Existing Role");

        Role existingRole = new Role();
        existingRole.setRoleId(UUID.randomUUID());
        existingRole.setRoleName("Existing Role");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(roleRepository.findByRoleNameIgnoreCase(anyString())).thenReturn(Optional.of(existingRole));

        // When & Then
        AppException exception = assertThrows(AppException.class,
                () -> roleService.updateRole(roleId, request));

        assertEquals(ErrorCode.NAME_EXISTED, exception.getErrorCode());
    }

    @Test
    void updateRole_CannotRenameToAdmin() {
        // Given
        mockAuthentication("Quản trị viên");
        UUID roleId = testRole.getRoleId();
        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("Quản trị viên");

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> roleService.updateRole(roleId, request));

        assertTrue(exception.getMessage().contains("Không thể đổi tên thành 'Quản trị viên'"));
    }

    @Test
    void deleteRole_Success() {
        // Given
        mockAuthentication("Quản trị viên");
        UUID roleId = testRole.getRoleId();
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
        UUID roleId = adminRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(adminRole));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.deleteRole(roleId));

        assertTrue(exception.getMessage().contains("Không thể xóa vai trò 'Quản trị viên'"));
        verify(roleRepository, never()).deleteById(any());
    }

    @Test
    void deleteRole_OwnerRoleAsOwner_ThrowsException() {
        // Given
        mockAuthentication("Chủ cửa hàng");
        UUID roleId = ownerRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(ownerRole));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.deleteRole(roleId));

        assertTrue(exception.getMessage().contains("Chủ cửa hàng không được phép xóa"));
        verify(roleRepository, never()).deleteById(any());
    }

    @Test
    void deleteRole_CurrentUserRole_ThrowsException() {
        // Given
        mockAuthentication("Nhân viên");
        UUID roleId = testRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.deleteRole(roleId));

        assertTrue(exception.getMessage().contains("Bạn không thể xóa vai trò mà chính bạn đang sở hữu"));
        verify(roleRepository, never()).deleteById(any());
    }

    @Test
    void deleteRole_RoleInUse_ThrowsException() {
        // Given
        mockAuthentication("Quản trị viên");
        UUID roleId = testRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(accountRepository.countAccountsByRoleId(roleId)).thenReturn(5L);

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.deleteRole(roleId));

        assertTrue(exception.getMessage().contains("Vai trò đang được sử dụng bởi 5 tài khoản"));
        verify(roleRepository, never()).deleteById(any());
    }

    @Test
    void deleteRole_NotFound_ThrowsException() {
        // Given
        UUID roleId = UUID.randomUUID();
        when(roleRepository.findById(roleId)).thenReturn(Optional.empty());

        // When & Then
        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> roleService.deleteRole(roleId));

        assertTrue(exception.getMessage().contains("Không tìm thấy vai trò"));
    }

    @Test
    void toggleRoleStatus_Success_ActivateRole() {
        // Given
        mockAuthentication("Quản trị viên");
        testRole.setActive(false);
        UUID roleId = testRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        RoleResponse response = roleService.toggleRoleStatus(roleId);

        // Then
        assertTrue(response.getActive());
        verify(roleRepository).save(argThat(role -> role.getActive() == true));
    }

    @Test
    void toggleRoleStatus_Success_DeactivateRole() {
        // Given
        mockAuthentication("Quản trị viên");
        testRole.setActive(true);
        UUID roleId = testRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        RoleResponse response = roleService.toggleRoleStatus(roleId);

        // Then
        assertFalse(response.getActive());
        verify(roleRepository).save(argThat(role -> role.getActive() == false));
    }

    @Test
    void toggleRoleStatus_NullActive_SetsToTrue() {
        // Given
        mockAuthentication("Quản trị viên");
        testRole.setActive(null);
        UUID roleId = testRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(roleRepository.save(any(Role.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        RoleResponse response = roleService.toggleRoleStatus(roleId);

        // Then
        assertTrue(response.getActive());
        verify(roleRepository).save(argThat(role -> role.getActive() == true));
    }

    @Test
    void toggleRoleStatus_AdminRole_ThrowsException() {
        // Given
        UUID roleId = adminRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(adminRole));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.toggleRoleStatus(roleId));

        assertTrue(exception.getMessage().contains("Không thể thay đổi trạng thái vai trò 'Quản trị viên'"));
    }

    @Test
    void toggleRoleStatus_OwnerRoleAsOwner_ThrowsException() {
        // Given
        mockAuthentication("Chủ cửa hàng");
        UUID roleId = ownerRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(ownerRole));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.toggleRoleStatus(roleId));

        assertTrue(exception.getMessage().contains("Chủ cửa hàng không được phép thay đổi trạng thái"));
    }

    @Test
    void toggleRoleStatus_CurrentUserRole_ThrowsException() {
        // Given
        mockAuthentication("Nhân viên");
        UUID roleId = testRole.getRoleId();
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> roleService.toggleRoleStatus(roleId));

        assertTrue(exception.getMessage().contains("Bạn không thể thay đổi trạng thái vai trò mà chính bạn đang sở hữu"));
    }

    @Test
    void toggleRoleStatus_NotFound_ThrowsException() {
        // Given
        UUID roleId = UUID.randomUUID();
        when(roleRepository.findById(roleId)).thenReturn(Optional.empty());

        // When & Then
        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> roleService.toggleRoleStatus(roleId));

        assertTrue(exception.getMessage().contains("Không tìm thấy vai trò"));
    }

    @Test
    void searchRolesPaged_Success() {
        // Given
        List<Role> roles = Arrays.asList(testRole, ownerRole);
        when(roleRepository.findRolesForSearch(any())).thenReturn(roles);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        PageResponse<RoleResponse> response = roleService.searchRolesPaged(null, null, pageable);

        // Then
        assertNotNull(response);
        assertEquals(2, response.getTotalElements());
        assertEquals(1, response.getTotalPages());
        verify(roleRepository).findRolesForSearch(any());
    }

    @Test
    void searchRolesPaged_WithKeyword() {
        // Given
        List<Role> roles = Arrays.asList(testRole, ownerRole, adminRole);
        when(roleRepository.findRolesForSearch(any())).thenReturn(roles);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        PageResponse<RoleResponse> response = roleService.searchRolesPaged("Nhân", null, pageable);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getContent().size());
        assertEquals("Nhân viên", response.getContent().get(0).getRoleName());
    }

    @Test
    void searchRolesPaged_WithActiveFilter() {
        // Given
        testRole.setActive(true);
        ownerRole.setActive(false);
        List<Role> activeRoles = Collections.singletonList(testRole);
        when(roleRepository.findRolesForSearch(true)).thenReturn(activeRoles);
        Pageable pageable = PageRequest.of(0, 10);

        // When
        PageResponse<RoleResponse> response = roleService.searchRolesPaged(null, true, pageable);

        // Then
        assertEquals(1, response.getTotalElements());
        verify(roleRepository).findRolesForSearch(true);
    }

    @Test
    void searchRolesPaged_Pagination() {
        // Given
        List<Role> manyRoles = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            Role role = new Role();
            role.setRoleId(UUID.randomUUID());
            role.setRoleName("Role " + i);
            role.setActive(true);
            manyRoles.add(role);
        }
        when(roleRepository.findRolesForSearch(any())).thenReturn(manyRoles);
        Pageable pageable = PageRequest.of(1, 10);

        // When
        PageResponse<RoleResponse> response = roleService.searchRolesPaged(null, null, pageable);

        // Then
        assertEquals(25, response.getTotalElements());
        assertEquals(3, response.getTotalPages());
        assertEquals(10, response.getContent().size());
        assertEquals(1, response.getNumber());
        assertFalse(response.isFirst());
        assertFalse(response.isLast());
    }

    @Test
    void searchRolesPaged_EmptyResult() {
        // Given
        when(roleRepository.findRolesForSearch(any())).thenReturn(Collections.emptyList());
        Pageable pageable = PageRequest.of(0, 10);

        // When
        PageResponse<RoleResponse> response = roleService.searchRolesPaged(null, null, pageable);

        // Then
        assertTrue(response.isEmpty());
        assertEquals(0, response.getTotalElements());
    }

    @Test
    void toResponse_WithNullActive_DefaultsToFalse() {
        // Given
        Role role = new Role();
        role.setRoleId(UUID.randomUUID());
        role.setRoleName("Test");
        role.setActive(null);
        role.setCreatedDate(new Date());

        when(roleRepository.findById(any())).thenReturn(Optional.of(role));

        // When
        RoleResponse response = roleService.getRoleById(role.getRoleId());

        // Then
        assertFalse(response.getActive()); // Defaults to false when null
    }
}
