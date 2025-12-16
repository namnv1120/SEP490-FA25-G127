package com.g127.snapbuy.admin.service.impl;

import com.g127.snapbuy.admin.dto.response.AdminAccountResponse;
import com.g127.snapbuy.tenant.context.TenantContext;
import com.g127.snapbuy.tenant.entity.Tenant;
import com.g127.snapbuy.tenant.repository.TenantRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAccountServiceImplTest {

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private DataSource tenantDataSource;

    @Mock
    private Connection connection;

    @Mock
    private PreparedStatement preparedStatement;

    @Mock
    private ResultSet resultSet;

    @InjectMocks
    private AdminAccountServiceImpl adminAccountService;

    private Tenant testTenant1;
    private Tenant testTenant2;
    private MockedStatic<TenantContext> tenantContextMock;

    @BeforeEach
    void setUp() throws SQLException {
        testTenant1 = Tenant.builder()
                .tenantId(UUID.randomUUID())
                .tenantCode("TENANT1")
                .tenantName("Test Tenant 1")
                .dbName("SnapBuy_Tenant1")
                .isActive(true)
                .build();

        testTenant2 = Tenant.builder()
                .tenantId(UUID.randomUUID())
                .tenantCode("TENANT2")
                .tenantName("Test Tenant 2")
                .dbName("SnapBuy_Tenant2")
                .isActive(true)
                .build();

        tenantContextMock = mockStatic(TenantContext.class);
        
        // Setup default lenient mocks for connection (will be overridden by specific tests)
        lenient().when(tenantDataSource.getConnection()).thenReturn(connection);
        lenient().when(connection.prepareStatement(anyString())).thenReturn(preparedStatement);
    }

    @AfterEach
    void tearDown() {
        if (tenantContextMock != null) {
            tenantContextMock.close();
        }
    }

    @Test
    void getAllAccountsFromAllTenants_Success() throws SQLException {
        // Given
        when(tenantDataSource.getConnection()).thenReturn(connection);
        when(connection.prepareStatement(anyString())).thenReturn(preparedStatement);
        
        List<Tenant> tenants = Arrays.asList(testTenant1, testTenant2);
        when(tenantRepository.findAll()).thenReturn(tenants);
        
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true, false, true, false); // 1 account per tenant
        when(resultSet.getString("account_id")).thenReturn(
                UUID.randomUUID().toString(),
                UUID.randomUUID().toString()
        );
        when(resultSet.getString("full_name")).thenReturn("User 1", "User 2");
        when(resultSet.getString("email")).thenReturn("user1@test.com", "user2@test.com");
        when(resultSet.getString("phone")).thenReturn("0123456789", "0987654321");
        when(resultSet.getString("role_name")).thenReturn("Admin", "Staff");
        when(resultSet.getInt("active")).thenReturn(1, 1);
        when(resultSet.getObject("created_date", LocalDateTime.class)).thenReturn(LocalDateTime.now());
        when(resultSet.getObject("updated_date", LocalDateTime.class)).thenReturn(LocalDateTime.now());

        // When
        List<AdminAccountResponse> result = adminAccountService.getAllAccountsFromAllTenants();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(tenantRepository).findAll();
        tenantContextMock.verify(() -> TenantContext.setCurrentTenant(anyString()), times(2));
        tenantContextMock.verify(() -> TenantContext.clear(), times(2));
    }

    @Test
    void getAllAccountsFromAllTenants_EmptyTenants() {
        // Given
        when(tenantRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<AdminAccountResponse> result = adminAccountService.getAllAccountsFromAllTenants();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(tenantRepository).findAll();
    }

    @Test
    void getAllAccountsFromAllTenants_OneTenantFails_ContinuesWithOthers() throws SQLException {
        // Given
        List<Tenant> tenants = Arrays.asList(testTenant1, testTenant2);
        when(tenantRepository.findAll()).thenReturn(tenants);
        
        // First tenant throws exception
        when(connection.prepareStatement(anyString()))
                .thenThrow(new SQLException("Connection failed"))
                .thenReturn(preparedStatement);
        
        // Second tenant succeeds
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true, false);
        when(resultSet.getString("account_id")).thenReturn(UUID.randomUUID().toString());
        when(resultSet.getString("full_name")).thenReturn("User 2");
        when(resultSet.getString("email")).thenReturn("user2@test.com");
        when(resultSet.getString("phone")).thenReturn("0987654321");
        when(resultSet.getString("role_name")).thenReturn("Staff");
        when(resultSet.getInt("active")).thenReturn(1);
        when(resultSet.getObject("created_date", LocalDateTime.class)).thenReturn(LocalDateTime.now());
        when(resultSet.getObject("updated_date", LocalDateTime.class)).thenReturn(null);

        // When
        List<AdminAccountResponse> result = adminAccountService.getAllAccountsFromAllTenants();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size()); // Only successful tenant's account
        tenantContextMock.verify(() -> TenantContext.clear(), times(2)); // Both attempts clear context
    }

    @Test
    void searchAccountsFromAllTenants_WithKeyword() throws SQLException {
        // Given
        List<Tenant> tenants = Collections.singletonList(testTenant1);
        when(tenantRepository.findAll()).thenReturn(tenants);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true, false);
        when(resultSet.getString("account_id")).thenReturn(UUID.randomUUID().toString());
        when(resultSet.getString("full_name")).thenReturn("John Doe");
        when(resultSet.getString("email")).thenReturn("john@test.com");
        when(resultSet.getString("phone")).thenReturn("0123456789");
        when(resultSet.getString("role_name")).thenReturn("Manager");
        when(resultSet.getInt("active")).thenReturn(1);
        when(resultSet.getObject("created_date", LocalDateTime.class)).thenReturn(LocalDateTime.now());
        when(resultSet.getObject("updated_date", LocalDateTime.class)).thenReturn(null);

        // When
        List<AdminAccountResponse> result = adminAccountService.searchAccountsFromAllTenants("John", null, null);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getFullName());
        verify(preparedStatement, atLeastOnce()).setObject(anyInt(), anyString());
    }

    @Test
    void searchAccountsFromAllTenants_WithActiveFilter() throws SQLException {
        // Given
        List<Tenant> tenants = Collections.singletonList(testTenant1);
        when(tenantRepository.findAll()).thenReturn(tenants);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true, false);
        when(resultSet.getString("account_id")).thenReturn(UUID.randomUUID().toString());
        when(resultSet.getString("full_name")).thenReturn("Active User");
        when(resultSet.getString("email")).thenReturn("active@test.com");
        when(resultSet.getString("phone")).thenReturn("0123456789");
        when(resultSet.getString("role_name")).thenReturn("Staff");
        when(resultSet.getInt("active")).thenReturn(1);
        when(resultSet.getObject("created_date", LocalDateTime.class)).thenReturn(LocalDateTime.now());
        when(resultSet.getObject("updated_date", LocalDateTime.class)).thenReturn(null);

        // When
        List<AdminAccountResponse> result = adminAccountService.searchAccountsFromAllTenants(null, true, null);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getActive());
        verify(preparedStatement, atLeastOnce()).setObject(anyInt(), eq(1)); // active = 1
    }

    @Test
    void searchAccountsFromAllTenants_WithRoleFilter() throws SQLException {
        // Given
        List<Tenant> tenants = Collections.singletonList(testTenant1);
        when(tenantRepository.findAll()).thenReturn(tenants);
        
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true, false);
        when(resultSet.getString("account_id")).thenReturn(UUID.randomUUID().toString());
        when(resultSet.getString("full_name")).thenReturn("Admin User");
        when(resultSet.getString("email")).thenReturn("admin@test.com");
        when(resultSet.getString("phone")).thenReturn("0123456789");
        when(resultSet.getString("role_name")).thenReturn("Admin");
        when(resultSet.getInt("active")).thenReturn(1);
        when(resultSet.getObject("created_date", LocalDateTime.class)).thenReturn(LocalDateTime.now());
        when(resultSet.getObject("updated_date", LocalDateTime.class)).thenReturn(null);

        // When
        List<AdminAccountResponse> result = adminAccountService.searchAccountsFromAllTenants(null, null, "Admin");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Admin", result.get(0).getRoleName());
        verify(preparedStatement).setObject(eq(1), eq("Admin"));
    }

    @Test
    void searchAccountsFromAllTenants_CombinedFilters() throws SQLException {
        // Given
        List<Tenant> tenants = Collections.singletonList(testTenant1);
        when(tenantRepository.findAll()).thenReturn(tenants);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(false); // No results

        // When
        List<AdminAccountResponse> result = adminAccountService.searchAccountsFromAllTenants("test", true, "Staff");

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(preparedStatement, atLeastOnce()).setObject(anyInt(), anyString());
        verify(preparedStatement, atLeastOnce()).setObject(anyInt(), eq(1));
    }

    @Test
    void searchAccountsFromAllTenants_EmptyKeyword_IgnoresKeywordFilter() throws SQLException {
        // Given
        List<Tenant> tenants = Collections.singletonList(testTenant1);
        when(tenantRepository.findAll()).thenReturn(tenants);
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(false);

        // When
        List<AdminAccountResponse> result = adminAccountService.searchAccountsFromAllTenants("   ", null, null);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void deleteAccountFromTenant_Success() throws SQLException {
        // Given
        String tenantId = testTenant1.getTenantId().toString();
        UUID accountId = UUID.randomUUID();
        
        when(preparedStatement.executeUpdate()).thenReturn(1);

        // When
        adminAccountService.deleteAccountFromTenant(tenantId, accountId);

        // Then
        tenantContextMock.verify(() -> TenantContext.setCurrentTenant(tenantId));
        verify(preparedStatement).setObject(1, accountId);
        verify(preparedStatement).executeUpdate();
        tenantContextMock.verify(() -> TenantContext.clear());
    }

    @Test
    void deleteAccountFromTenant_AccountNotFound_ThrowsException() throws SQLException {
        // Given
        String tenantId = testTenant1.getTenantId().toString();
        UUID accountId = UUID.randomUUID();
        
        when(preparedStatement.executeUpdate()).thenReturn(0); // No rows affected

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> adminAccountService.deleteAccountFromTenant(tenantId, accountId));

        assertTrue(exception.getMessage().contains("Account not found"));
        tenantContextMock.verify(() -> TenantContext.clear());
    }

    @Test
    void deleteAccountFromTenant_SQLException_ThrowsRuntimeException() throws SQLException {
        // Given
        String tenantId = testTenant1.getTenantId().toString();
        UUID accountId = UUID.randomUUID();
        
        when(connection.prepareStatement(anyString())).thenThrow(new SQLException("Database error"));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> adminAccountService.deleteAccountFromTenant(tenantId, accountId));

        assertTrue(exception.getMessage().contains("Failed to delete account"));
        tenantContextMock.verify(() -> TenantContext.clear());
    }

    @Test
    void toggleAccountStatus_Success() throws SQLException {
        // Given
        String tenantId = testTenant1.getTenantId().toString();
        UUID accountId = UUID.randomUUID();
        
        when(preparedStatement.executeUpdate()).thenReturn(1);

        // When
        adminAccountService.toggleAccountStatus(tenantId, accountId);

        // Then
        tenantContextMock.verify(() -> TenantContext.setCurrentTenant(tenantId));
        verify(preparedStatement).setObject(1, accountId);
        verify(preparedStatement).executeUpdate();
        tenantContextMock.verify(() -> TenantContext.clear());
    }

    @Test
    void toggleAccountStatus_AccountNotFound_ThrowsException() throws SQLException {
        // Given
        String tenantId = testTenant1.getTenantId().toString();
        UUID accountId = UUID.randomUUID();
        
        when(preparedStatement.executeUpdate()).thenReturn(0); // No rows affected

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> adminAccountService.toggleAccountStatus(tenantId, accountId));

        assertTrue(exception.getMessage().contains("Account not found"));
        tenantContextMock.verify(() -> TenantContext.clear());
    }

    @Test
    void toggleAccountStatus_SQLException_ThrowsRuntimeException() throws SQLException {
        // Given
        String tenantId = testTenant1.getTenantId().toString();
        UUID accountId = UUID.randomUUID();
        
        when(connection.prepareStatement(anyString())).thenThrow(new SQLException("Database error"));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> adminAccountService.toggleAccountStatus(tenantId, accountId));

        assertTrue(exception.getMessage().contains("Failed to toggle account status"));
        tenantContextMock.verify(() -> TenantContext.clear());
    }

    @Test
    void toggleAccountStatus_EnsuresContextCleared_OnException() throws SQLException {
        // Given
        String tenantId = testTenant1.getTenantId().toString();
        UUID accountId = UUID.randomUUID();
        
        doThrow(new SQLException("Unexpected error")).when(preparedStatement).executeUpdate();

        // When & Then
        assertThrows(RuntimeException.class,
                () -> adminAccountService.toggleAccountStatus(tenantId, accountId));

        // Verify context is still cleared even after exception
        tenantContextMock.verify(() -> TenantContext.clear());
    }

    @Test
    void searchAccountsFromAllTenants_MultipleAccounts() throws SQLException {
        // Given
        List<Tenant> tenants = Collections.singletonList(testTenant1);
        when(tenantRepository.findAll()).thenReturn(tenants);
        
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true, true, true, false); // 3 accounts
        
        UUID[] accountIds = {UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID()};
        when(resultSet.getString("account_id"))
                .thenReturn(accountIds[0].toString(), accountIds[1].toString(), accountIds[2].toString());
        when(resultSet.getString("full_name")).thenReturn("User 1", "User 2", "User 3");
        when(resultSet.getString("email")).thenReturn("user1@test.com", "user2@test.com", "user3@test.com");
        when(resultSet.getString("phone")).thenReturn("0123456789", "0123456788", "0123456787");
        when(resultSet.getString("role_name")).thenReturn("Admin", "Staff", "Manager");
        when(resultSet.getInt("active")).thenReturn(1, 0, 1);
        when(resultSet.getObject("created_date", LocalDateTime.class)).thenReturn(LocalDateTime.now());
        when(resultSet.getObject("updated_date", LocalDateTime.class)).thenReturn(null);

        // When
        List<AdminAccountResponse> result = adminAccountService.searchAccountsFromAllTenants(null, null, null);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("User 1", result.get(0).getFullName());
        assertEquals("User 2", result.get(1).getFullName());
        assertEquals("User 3", result.get(2).getFullName());
        assertTrue(result.get(0).getActive());
        assertFalse(result.get(1).getActive());
        assertTrue(result.get(2).getActive());
    }

    @Test
    void searchAccountsFromAllTenants_IncludesTenantInfo() throws SQLException {
        // Given
        List<Tenant> tenants = Collections.singletonList(testTenant1);
        when(tenantRepository.findAll()).thenReturn(tenants);
        
        when(preparedStatement.executeQuery()).thenReturn(resultSet);
        when(resultSet.next()).thenReturn(true, false);
        when(resultSet.getString("account_id")).thenReturn(UUID.randomUUID().toString());
        when(resultSet.getString("full_name")).thenReturn("Test User");
        when(resultSet.getString("email")).thenReturn("test@test.com");
        when(resultSet.getString("phone")).thenReturn("0123456789");
        when(resultSet.getString("role_name")).thenReturn("Staff");
        when(resultSet.getInt("active")).thenReturn(1);
        when(resultSet.getObject("created_date", LocalDateTime.class)).thenReturn(LocalDateTime.now());
        when(resultSet.getObject("updated_date", LocalDateTime.class)).thenReturn(null);

        // When
        List<AdminAccountResponse> result = adminAccountService.searchAccountsFromAllTenants(null, null, null);

        // Then
        assertEquals(1, result.size());
        assertEquals(testTenant1.getTenantId().toString(), result.get(0).getTenantId());
        assertEquals(testTenant1.getTenantName(), result.get(0).getTenantName());
    }
}
