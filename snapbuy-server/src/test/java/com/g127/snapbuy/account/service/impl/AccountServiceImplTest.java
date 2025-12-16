package com.g127.snapbuy.account.service.impl;

import com.g127.snapbuy.account.dto.request.*;
import com.g127.snapbuy.account.dto.response.AccountResponse;
import com.g127.snapbuy.common.response.PageResponse;
import com.g127.snapbuy.account.entity.Account;
import com.g127.snapbuy.account.entity.Role;
import com.g127.snapbuy.common.exception.AppException;
import com.g127.snapbuy.account.mapper.AccountMapper;
import com.g127.snapbuy.account.repository.AccountRepository;
import com.g127.snapbuy.account.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AccountMapper accountMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AccountServiceImpl accountService;

    private Account testAccount;
    private Role testRole;
    private AccountCreateRequest createRequest;
    private AccountResponse accountResponse;

    @BeforeEach
    void setUp() {
        // Set upload directory for tests
        ReflectionTestUtils.setField(accountService, "uploadDir", "uploads");

        // Setup test data
        testRole = new Role();
        testRole.setRoleId(UUID.randomUUID());
        testRole.setRoleName("Chủ cửa hàng");
        testRole.setActive(true);

        testAccount = new Account();
        testAccount.setAccountId(UUID.randomUUID());
        testAccount.setUsername("testuser");
        testAccount.setPasswordHash("hashedPassword");
        testAccount.setFullName("Test User");
        testAccount.setActive(true);
        testAccount.setRoles(new LinkedHashSet<>(Collections.singletonList(testRole)));

        createRequest = new AccountCreateRequest();
        createRequest.setUsername("newuser");
        createRequest.setPassword("password123");
        createRequest.setConfirmPassword("password123");
        createRequest.setFullName("New User");

        accountResponse = AccountResponse.builder()
                .id(testAccount.getAccountId())
                .username(testAccount.getUsername())
                .fullName(testAccount.getFullName())
                .active(true)
                .build();
    }

    // Disabled - createAccount() method removed for multi-tenancy (accounts managed in Master DB)
    // @Test
    // void createAccount_Success() {
    //     // Given
    //     createRequest.setRoles(List.of("Chủ cửa hàng"));
    //     when(roleRepository.findByRoleNameIgnoreCase("Chủ cửa hàng")).thenReturn(Optional.of(testRole));
    //     when(accountRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
    //     when(accountMapper.toEntity(any(AccountCreateRequest.class))).thenReturn(testAccount);
    //     when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
    //     when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
    //     when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);
    //
    //     // When
    //     AccountResponse result = accountService.createAccount(createRequest);
    //
    //     // Then
    //     assertNotNull(result);
    //     assertEquals(accountResponse.getUsername(), result.getUsername());
    //     verify(accountRepository, times(2)).save(any(Account.class));
    //     verify(passwordEncoder).encode("password123");
    // }
    //
    // @Test
    // void createAccount_WithoutRoles_DefaultsToShopOwner() {
    //     // Given
    //     createRequest.setRoles(null);
    //     when(roleRepository.findByRoleNameIgnoreCase("Chủ cửa hàng")).thenReturn(Optional.of(testRole));
    //     when(accountRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
    //     when(accountMapper.toEntity(any(AccountCreateRequest.class))).thenReturn(testAccount);
    //     when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
    //     when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
    //     when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);
    //
    //     // When
    //     AccountResponse result = accountService.createAccount(createRequest);
    //
    //     // Then
    //     assertNotNull(result);
    //     verify(roleRepository).findByRoleNameIgnoreCase("Chủ cửa hàng");
    // }
    //
    // @Test
    // void createAccount_PasswordMismatch_ThrowsException() {
    //     // Given
    //     createRequest.setConfirmPassword("differentPassword");
    //
    //     // When & Then
    //     assertThrows(IllegalArgumentException.class, () -> accountService.createAccount(createRequest));
    //     verify(accountRepository, never()).save(any(Account.class));
    // }
    //
    // @Test
    // void createAccount_UsernameExists_ThrowsException() {
    //     // Given
    //     when(accountRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(true);
    //
    //     // When & Then
    //     assertThrows(IllegalArgumentException.class, () -> accountService.createAccount(createRequest));
    //     verify(accountRepository, never()).save(any(Account.class));
    // }
    //
    // @Test
    // void createAccount_UsernameWithSpaces_ThrowsException() {
    //     // Given
    //     createRequest.setUsername("user name");
    //
    //     // When & Then
    //     assertThrows(IllegalArgumentException.class, () -> accountService.createAccount(createRequest));
    // }
    //
    // @Test
    // void createAccount_RoleNotFound_ThrowsException() {
    //     // Given
    //     createRequest.setRoles(List.of("NonExistentRole"));
    //     when(roleRepository.findByRoleNameIgnoreCase(anyString())).thenReturn(Optional.empty());
    //     when(accountRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
    //
    //     // When & Then
    //     assertThrows(NoSuchElementException.class, () -> accountService.createAccount(createRequest));
    // }
    //
    // @Test
    // void createAccount_InactiveRole_ThrowsException() {
    //     // Given
    //     testRole.setActive(false);
    //     createRequest.setRoles(List.of("Chủ cửa hàng"));
    //     when(roleRepository.findByRoleNameIgnoreCase("Chủ cửa hàng")).thenReturn(Optional.of(testRole));
    //     when(accountRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
    //
    //     // When & Then
    //     assertThrows(IllegalStateException.class, () -> accountService.createAccount(createRequest));
    // }

    @Test
    void createStaff_Success() {
        // Given
        Role staffRole = new Role();
        staffRole.setRoleId(UUID.randomUUID());
        staffRole.setRoleName("Nhân viên bán hàng");
        staffRole.setActive(true);

        createRequest.setRoles(List.of("Nhân viên bán hàng"));
        when(roleRepository.findByRoleNameIgnoreCase("Nhân viên bán hàng")).thenReturn(Optional.of(staffRole));
        when(accountRepository.existsByUsernameIgnoreCase(anyString())).thenReturn(false);
        when(accountMapper.toEntity(any(AccountCreateRequest.class))).thenReturn(testAccount);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.createStaff(createRequest);

        // Then
        assertNotNull(result);
        verify(accountRepository, times(2)).save(any(Account.class));
    }

    @Test
    void createStaff_WithoutRoles_ThrowsException() {
        // Given
        createRequest.setRoles(null);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> accountService.createStaff(createRequest));
    }



    @Test
    void getMyInfo_Success() {
        // Given
        setupSecurityContext("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.of(testAccount));
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.getMyInfo();

        // Then
        assertNotNull(result);
        assertEquals(accountResponse.getUsername(), result.getUsername());
    }

    @Test
    void getMyInfo_AccountNotFound_ThrowsException() {
        // Given
        setupSecurityContext("testuser");
        when(accountRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, () -> accountService.getMyInfo());
    }

    @Test
    void getAccounts_Success() {
        // Given
        List<Account> accounts = Arrays.asList(testAccount);
        when(accountRepository.findAll()).thenReturn(accounts);
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        List<AccountResponse> result = accountService.getAccounts();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void getAccount_Success() {
        // Given
        UUID accountId = testAccount.getAccountId();
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.getAccount(accountId);

        // Then
        assertNotNull(result);
        assertEquals(accountResponse.getUsername(), result.getUsername());
    }

    @Test
    void getAccount_NotFound_ThrowsException() {
        // Given
        UUID accountId = UUID.randomUUID();
        when(accountRepository.findById(accountId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, () -> accountService.getAccount(accountId));
    }

    @Test
    void changePassword_Success() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPassword");
        request.setNewPassword("newPassword");
        request.setConfirmNewPassword("newPassword");

        when(accountRepository.findById(any(UUID.class))).thenReturn(Optional.of(testAccount));
        when(passwordEncoder.matches("oldPassword", testAccount.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.matches("newPassword", testAccount.getPasswordHash())).thenReturn(false);
        when(passwordEncoder.encode("newPassword")).thenReturn("newHashedPassword");
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.changePassword(testAccount.getAccountId(), request);

        // Then
        assertNotNull(result);
        verify(passwordEncoder).encode("newPassword");
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void changePassword_PasswordMismatch_ThrowsException() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPassword");
        request.setNewPassword("newPassword");
        request.setConfirmNewPassword("differentPassword");

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> accountService.changePassword(testAccount.getAccountId(), request));
    }

    @Test
    void changePassword_WrongOldPassword_ThrowsException() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("wrongPassword");
        request.setNewPassword("newPassword");
        request.setConfirmNewPassword("newPassword");

        when(accountRepository.findById(any(UUID.class))).thenReturn(Optional.of(testAccount));
        when(passwordEncoder.matches("wrongPassword", testAccount.getPasswordHash())).thenReturn(false);

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> accountService.changePassword(testAccount.getAccountId(), request));
    }

    @Test
    void changePassword_SameAsOldPassword_ThrowsException() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("oldPassword");
        request.setNewPassword("oldPassword");
        request.setConfirmNewPassword("oldPassword");

        when(accountRepository.findById(any(UUID.class))).thenReturn(Optional.of(testAccount));
        when(passwordEncoder.matches("oldPassword", testAccount.getPasswordHash())).thenReturn(true);

        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> accountService.changePassword(testAccount.getAccountId(), request));
    }

    @Test
    void assignRole_Success() {
        // Given
        UUID accountId = testAccount.getAccountId();
        UUID roleId = testRole.getRoleId();
        
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.assignRole(accountId, roleId);

        // Then
        assertNotNull(result);
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void assignRole_AccountNotFound_ThrowsException() {
        // Given
        UUID accountId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        when(accountRepository.findById(accountId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, () -> accountService.assignRole(accountId, roleId));
    }

    @Test
    void assignRole_RoleNotFound_ThrowsException() {
        // Given
        UUID accountId = testAccount.getAccountId();
        UUID roleId = UUID.randomUUID();
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(roleRepository.findById(roleId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NoSuchElementException.class, () -> accountService.assignRole(accountId, roleId));
    }

    @Test
    void unassignRole_Success() {
        // Given
        setupSecurityContext("otheruser");
        UUID accountId = testAccount.getAccountId();
        UUID roleId = testRole.getRoleId();
        
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        // When
        accountService.unassignRole(accountId, roleId);

        // Then
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void unassignRole_LastAdmin_ThrowsException() {
        // Given
        Role adminRole = new Role();
        adminRole.setRoleId(UUID.randomUUID());
        adminRole.setRoleName("Quản trị viên");
        adminRole.setActive(true);

        UUID accountId = testAccount.getAccountId();
        UUID roleId = adminRole.getRoleId();
        
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(adminRole));
        when(accountRepository.countAccountsByRoleId(roleId)).thenReturn(1L);

        // When & Then
        assertThrows(IllegalStateException.class, () -> accountService.unassignRole(accountId, roleId));
    }

    @Test
    void unassignRole_SelfUnassign_ThrowsException() {
        // Given
        setupSecurityContext("testuser");
        UUID accountId = testAccount.getAccountId();
        UUID roleId = testRole.getRoleId();
        
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(roleRepository.findById(roleId)).thenReturn(Optional.of(testRole));

        // When & Then
        assertThrows(IllegalStateException.class, () -> accountService.unassignRole(accountId, roleId));
    }

    @Test
    void toggleAccountStatus_Success() {
        // Given
        setupSecurityContext("otheruser");
        UUID accountId = testAccount.getAccountId();
        testAccount.setActive(true);
        
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.toggleAccountStatus(accountId);

        // Then
        assertNotNull(result);
        verify(accountRepository).save(argThat(account -> !account.getActive()));
    }

    @Test
    void toggleAccountStatus_SelfToggle_ThrowsException() {
        // Given
        setupSecurityContext("testuser");
        UUID accountId = testAccount.getAccountId();
        
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));

        // When & Then
        assertThrows(IllegalStateException.class, () -> accountService.toggleAccountStatus(accountId));
    }

    @Test
    void deleteAccount_Success() {
        // Given
        setupSecurityContext("otheruser");
        Role staffRole = new Role();
        staffRole.setRoleName("Nhân viên");
        testAccount.setRoles(new LinkedHashSet<>(Collections.singletonList(staffRole)));
        
        UUID accountId = testAccount.getAccountId();
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));

        // When
        accountService.deleteAccount(accountId);

        // Then
        verify(accountRepository).delete(testAccount);
    }

    @Test
    void deleteAccount_SelfDelete_ThrowsException() {
        // Given
        setupSecurityContext("testuser");
        UUID accountId = testAccount.getAccountId();
        
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(testAccount));

        // When & Then
        assertThrows(IllegalStateException.class, () -> accountService.deleteAccount(accountId));
    }



    @Test
    void updateStaffByOwner_Success() {
        // Given
        setupSecurityContext("owneruser"); // Setup security context with different user
        Role staffRole = new Role();
        staffRole.setRoleName("Nhân viên bán hàng");
        testAccount.setRoles(new LinkedHashSet<>(Collections.singletonList(staffRole)));

        StaffOwnerUpdateRequest request = new StaffOwnerUpdateRequest();
        request.setFullName("Updated Name");
        request.setActive(true);

        UUID staffId = testAccount.getAccountId();
        when(accountRepository.findById(staffId)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.updateStaffByOwner(staffId, request);

        // Then
        assertNotNull(result);
        verify(accountRepository).save(any(Account.class));
    }



    @Test
    void updateStaffRolesByOwner_Success() {
        // Given
        Role staffRole = new Role();
        staffRole.setRoleName("Nhân viên bán hàng");
        staffRole.setActive(true);
        testAccount.setRoles(new LinkedHashSet<>(Collections.singletonList(staffRole)));

        StaffRoleUpdateRequest request = new StaffRoleUpdateRequest();
        request.setRoles(List.of("Nhân viên kho"));

        Role warehouseRole = new Role();
        warehouseRole.setRoleName("Nhân viên kho");
        warehouseRole.setActive(true);

        UUID staffId = testAccount.getAccountId();
        when(accountRepository.findById(staffId)).thenReturn(Optional.of(testAccount));
        when(roleRepository.findByRoleNameIgnoreCase("Nhân viên kho")).thenReturn(Optional.of(warehouseRole));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        AccountResponse result = accountService.updateStaffRolesByOwner(staffId, request);

        // Then
        assertNotNull(result);
        verify(accountRepository).save(any(Account.class));
    }



    @Test
    void getAccountsByRoleName_Success() {
        // Given
        List<Account> accounts = Arrays.asList(testAccount);
        when(accountRepository.findByRoleName("Chủ cửa hàng")).thenReturn(accounts);
        when(accountMapper.toResponse(any(Account.class))).thenReturn(accountResponse);

        // When
        List<AccountResponse> result = accountService.getAccountsByRoleName("Chủ cửa hàng");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // Helper method to setup security context
    private void setupSecurityContext(String username) {
        when(authentication.getName()).thenReturn(username);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    // Helper method to setup admin security context
    @SuppressWarnings("unchecked")
    private void setupAdminSecurityContext(String username) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_Quản trị viên")
        );
        when(authentication.getName()).thenReturn(username);
        when(authentication.getAuthorities()).thenReturn((Collection) authorities);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }
}
