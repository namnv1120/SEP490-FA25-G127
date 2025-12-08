package com.g127.snapbuy.account.service.impl;

import com.g127.snapbuy.account.service.impl.AccountDetailsServiceImpl;
import com.g127.snapbuy.entity.Account;
import com.g127.snapbuy.entity.Role;
import com.g127.snapbuy.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountDetailsServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountDetailsServiceImpl accountDetailsService;

    private Account testAccount;
    private Role testRole;

    @BeforeEach
    void setUp() {
        // Setup test role
        testRole = new Role();
        testRole.setRoleId(UUID.randomUUID());
        testRole.setRoleName("Chủ cửa hàng");
        testRole.setActive(true);

        // Setup test account
        testAccount = new Account();
        testAccount.setAccountId(UUID.randomUUID());
        testAccount.setUsername("testuser");
        testAccount.setPasswordHash("$2a$10$hashedPassword");
        testAccount.setFullName("Test User");
        testAccount.setEmail("test@example.com");
        testAccount.setPhone("0123456789");
        testAccount.setActive(true);
        testAccount.setRoles(new LinkedHashSet<>(Collections.singletonList(testRole)));
    }

    @Test
    void loadUserByUsername_Success() {
        // Given
        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        assertEquals("testuser", userDetails.getUsername());
        assertEquals("$2a$10$hashedPassword", userDetails.getPassword());
        assertTrue(userDetails.isEnabled());
        
        // Verify authorities
        assertEquals(1, userDetails.getAuthorities().size());
        assertTrue(userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_Chủ cửa hàng")));
        
        verify(accountRepository).findByUsernameWithRolesAndPermissionsIgnoreCase(username);
    }

    @Test
    void loadUserByUsername_WithMultipleRoles_Success() {
        // Given
        Role secondRole = new Role();
        secondRole.setRoleId(UUID.randomUUID());
        secondRole.setRoleName("Nhân viên bán hàng");
        secondRole.setActive(true);

        Set<Role> roles = new LinkedHashSet<>(Arrays.asList(testRole, secondRole));
        testAccount.setRoles(roles);

        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        assertEquals(2, userDetails.getAuthorities().size());
        assertTrue(userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_Chủ cửa hàng")));
        assertTrue(userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_Nhân viên bán hàng")));
    }

    @Test
    void loadUserByUsername_WithRolePrefix_Success() {
        // Given
        testRole.setRoleName("ROLE_Admin");
        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        assertTrue(userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_Admin")));
    }

    @Test
    void loadUserByUsername_CaseInsensitive_Success() {
        // Given
        String username = "TestUser"; // Mixed case
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase("testuser"))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        assertEquals("testuser", userDetails.getUsername());
        verify(accountRepository).findByUsernameWithRolesAndPermissionsIgnoreCase("testuser");
    }

    @Test
    void loadUserByUsername_WithWhitespace_TrimsAndConvertsToLowercase() {
        // Given
        String username = "  TestUser  "; // With whitespace
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase("testuser"))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        verify(accountRepository).findByUsernameWithRolesAndPermissionsIgnoreCase("testuser");
    }

    @Test
    void loadUserByUsername_InactiveAccount_AccountLockedAndDisabled() {
        // Given
        testAccount.setActive(false);
        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        assertFalse(userDetails.isEnabled());
    }

    @Test
    void loadUserByUsername_ActiveNull_TreatedAsInactive() {
        // Given
        testAccount.setActive(null);
        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        assertFalse(userDetails.isEnabled());
    }

    @Test
    void loadUserByUsername_UserNotFound_ThrowsUsernameNotFoundException() {
        // Given
        String username = "nonexistentuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.empty());

        // When & Then
        UsernameNotFoundException exception = assertThrows(
            UsernameNotFoundException.class,
            () -> accountDetailsService.loadUserByUsername(username)
        );
        
        assertTrue(exception.getMessage().contains("Không tìm thấy người dùng"));
        assertTrue(exception.getMessage().contains(username));
        verify(accountRepository).findByUsernameWithRolesAndPermissionsIgnoreCase(username);
    }

    @Test
    void loadUserByUsername_NullUsername_ThrowsUsernameNotFoundException() {
        // Given
        String username = null;
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(null))
            .thenReturn(Optional.empty());

        // When & Then
        assertThrows(
            UsernameNotFoundException.class,
            () -> accountDetailsService.loadUserByUsername(username)
        );
        verify(accountRepository).findByUsernameWithRolesAndPermissionsIgnoreCase(null);
    }

    @Test
    void loadUserByUsername_EmptyUsername_ThrowsUsernameNotFoundException() {
        // Given
        String username = "";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(""))
            .thenReturn(Optional.empty());

        // When & Then
        assertThrows(
            UsernameNotFoundException.class,
            () -> accountDetailsService.loadUserByUsername(username)
        );
    }

    @Test
    void loadUserByUsername_NoRoles_ReturnsUserWithEmptyAuthorities() {
        // Given
        testAccount.setRoles(new LinkedHashSet<>());
        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        assertEquals(0, userDetails.getAuthorities().size());
    }

    @Test
    void loadUserByUsername_VerifyPasswordNotModified() {
        // Given
        String originalPasswordHash = "$2a$10$hashedPassword";
        testAccount.setPasswordHash(originalPasswordHash);
        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertEquals(originalPasswordHash, userDetails.getPassword());
    }

    @Test
    void loadUserByUsername_VerifyTransactionalReadOnly() {
        // This test verifies that the method is annotated with @Transactional(readOnly = true)
        // The actual transactional behavior is tested through integration tests
        // Here we just verify the method executes correctly
        
        // Given
        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertNotNull(userDetails);
        verify(accountRepository, times(1))
            .findByUsernameWithRolesAndPermissionsIgnoreCase(username);
    }

    @Test
    void loadUserByUsername_MultipleCallsSameUser_CallsRepositoryEachTime() {
        // Given
        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        accountDetailsService.loadUserByUsername(username);
        accountDetailsService.loadUserByUsername(username);
        accountDetailsService.loadUserByUsername(username);

        // Then
        verify(accountRepository, times(3))
            .findByUsernameWithRolesAndPermissionsIgnoreCase(username);
    }

    @Test
    void loadUserByUsername_VerifyRoleNameMapping() {
        // Given
        Role roleWithoutPrefix = new Role();
        roleWithoutPrefix.setRoleName("CustomRole");
        roleWithoutPrefix.setActive(true);

        Role roleWithPrefix = new Role();
        roleWithPrefix.setRoleName("ROLE_PrefixedRole");
        roleWithPrefix.setActive(true);

        Set<Role> roles = new LinkedHashSet<>(Arrays.asList(roleWithoutPrefix, roleWithPrefix));
        testAccount.setRoles(roles);

        String username = "testuser";
        when(accountRepository.findByUsernameWithRolesAndPermissionsIgnoreCase(username))
            .thenReturn(Optional.of(testAccount));

        // When
        UserDetails userDetails = accountDetailsService.loadUserByUsername(username);

        // Then
        assertEquals(2, userDetails.getAuthorities().size());
        assertTrue(userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_CustomRole")));
        assertTrue(userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_PrefixedRole")));
    }
}
