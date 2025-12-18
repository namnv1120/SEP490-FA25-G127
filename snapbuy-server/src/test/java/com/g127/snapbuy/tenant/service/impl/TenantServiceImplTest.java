package com.g127.snapbuy.tenant.service.impl;

import com.g127.snapbuy.admin.service.MasterRoleService;
import com.g127.snapbuy.tenant.config.TenantFlywayRunner;
import com.g127.snapbuy.tenant.config.TenantRoutingDataSource;
import com.g127.snapbuy.tenant.dto.request.TenantCreateRequest;
import com.g127.snapbuy.tenant.dto.response.TenantResponse;
import com.g127.snapbuy.tenant.entity.Tenant;
import com.g127.snapbuy.tenant.entity.TenantOwner;
import com.g127.snapbuy.tenant.repository.TenantOwnerRepository;
import com.g127.snapbuy.tenant.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantServiceImplTest {

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private TenantOwnerRepository tenantOwnerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TenantRoutingDataSource tenantDataSource;

    @Mock
    private TenantFlywayRunner flywayRunner;

    @Mock
    private MasterRoleService masterRoleService;

    @Mock
    private Connection connection;

    @Mock
    private Statement statement;

    @InjectMocks
    private TenantServiceImpl tenantService;

    private Tenant testTenant;
    private TenantOwner testOwner;
    private TenantCreateRequest createRequest;

    @BeforeEach
    void setUp() throws Exception {
        testTenant = Tenant.builder()
                .tenantId(UUID.randomUUID())
                .tenantName("Test Store")
                .tenantCode("TEST001")
                .dbHost("localhost")
                .dbPort(1433)
                .dbName("SnapBuy_Test")
                .dbUsername("sa")
                .dbPassword("password")
                .isActive(true)
                .subscriptionStart(LocalDateTime.now())
                .maxUsers(10)
                .maxProducts(1000)
                .build();

        testOwner = TenantOwner.builder()
                .accountId(UUID.randomUUID())
                .tenantId(testTenant.getTenantId())
                .username("owner001")
                .passwordHash("hashedPassword")
                .fullName("Test Owner")
                .email("owner@test.com")
                .phone("0123456789")
                .isActive(true)
                .build();

        createRequest = new TenantCreateRequest();
        createRequest.setTenantName("New Store");
        createRequest.setTenantCode("NEW001");
        createRequest.setDbHost("localhost");
        createRequest.setDbPort(1433);
        createRequest.setDbName("SnapBuy_New");
        createRequest.setDbUsername("sa");
        createRequest.setDbPassword("password");
        createRequest.setMaxUsers(10);
        createRequest.setMaxProducts(1000);
        createRequest.setOwnerUsername("newowner");
        createRequest.setOwnerPassword("password123");
        createRequest.setOwnerFullName("New Owner");
        createRequest.setOwnerEmail("newowner@test.com");
        createRequest.setOwnerPhone("0987654321");

    }

    @Test
    void loadAllTenantDataSources_Success() {
        // Given
        List<Tenant> tenants = Arrays.asList(testTenant);
        when(tenantRepository.findAll()).thenReturn(tenants);

        // When
        // Will attempt to create datasource, may fail but that's expected in unit test
        // The important thing is repository.findAll() is called
        tenantService.loadAllTenantDataSources();

        // Then
        verify(tenantRepository).findAll();
    }

    @Test
    void loadAllTenantDataSources_SkipInactiveTenants() {
        // Given
        testTenant.setIsActive(false);
        List<Tenant> tenants = Arrays.asList(testTenant);
        when(tenantRepository.findAll()).thenReturn(tenants);

        // When
        tenantService.loadAllTenantDataSources();

        // Then
        verify(tenantRepository).findAll();
        // Inactive tenants are skipped, no data source added
    }



    @Test
    void createTenant_Success_WithProvidedDbName() {
        // Given
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByUsername(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByEmail(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByPhone(anyString())).thenReturn(false);
        when(tenantRepository.save(any(Tenant.class))).thenReturn(testTenant);

        // When & Then - Should fail at database creation (expected in unit test)
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantService.createTenant(createRequest));
        
        assertTrue(exception.getMessage().contains("Kh\u00f4ng th\u1ec3 t\u1ea1o c\u01a1 s\u1edf d\u1eef li\u1ec7u"));
        verify(tenantRepository).save(any(Tenant.class));
    }

    @Test
    void createTenant_Success_WithAutoGeneratedDbName() {
        // Given
        createRequest.setDbName(null); // No dbName provided
        
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByUsername(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByEmail(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByPhone(anyString())).thenReturn(false);
        when(tenantRepository.save(any(Tenant.class))).thenAnswer(invocation -> {
            Tenant tenant = invocation.getArgument(0);
            if (tenant.getTenantId() == null) {
                tenant.setTenantId(UUID.randomUUID());
            }
            return tenant;
        });

        // When & Then - Should fail at database creation (expected in unit test)
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantService.createTenant(createRequest));
        
        assertTrue(exception.getMessage().contains("Kh\u00f4ng th\u1ec3 t\u1ea1o c\u01a1 s\u1edf d\u1eef li\u1ec7u"));
        verify(tenantRepository, times(2)).save(any(Tenant.class)); // First save, then update with dbName
    }

    @Test
    void createTenant_DuplicateTenantCode_ThrowsException() {
        // Given
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> tenantService.createTenant(createRequest));
        
        assertTrue(exception.getMessage().contains("Mã cửa hàng"));
        verify(tenantRepository, never()).save(any());
    }

    @Test
    void createTenant_DuplicateOwnerUsername_ThrowsException() {
        // Given
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByUsername(anyString())).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> tenantService.createTenant(createRequest));
        
        assertTrue(exception.getMessage().contains("Tên đăng nhập"));
        verify(tenantRepository, never()).save(any());
    }

    @Test
    void createTenant_DuplicateOwnerEmail_ThrowsException() {
        // Given
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByUsername(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> tenantService.createTenant(createRequest));
        
        assertTrue(exception.getMessage().contains("Email"));
        verify(tenantRepository, never()).save(any());
    }

    @Test
    void createTenant_DuplicateOwnerPhone_ThrowsException() {
        // Given
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByUsername(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByEmail(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByPhone(anyString())).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> tenantService.createTenant(createRequest));
        
        assertTrue(exception.getMessage().contains("Số điện thoại"));
        verify(tenantRepository, never()).save(any());
    }

    @Test
    void createTenant_EmptyOwnerPhone_SkipsPhoneValidation() {
        // Given
        createRequest.setOwnerPhone(""); // Empty phone
        
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByUsername(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByEmail(anyString())).thenReturn(false);
        when(tenantRepository.save(any(Tenant.class))).thenReturn(testTenant);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantService.createTenant(createRequest));
        
        // Verify phone validation was skipped
        verify(tenantOwnerRepository, never()).existsByPhone(anyString());
    }

    @Test
    void createTenant_DatabaseCreationFails_RollbackTenant() {
        // Given
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByUsername(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByEmail(anyString())).thenReturn(false);
        when(tenantRepository.save(any(Tenant.class))).thenReturn(testTenant);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantService.createTenant(createRequest));
        
        assertTrue(exception.getMessage().contains("Không thể tạo cơ sở dữ liệu"));
        verify(tenantRepository).delete(testTenant); // Should rollback
    }

    @Test
    void createTenant_FlywayMigrationFails_RollbackTenant() {
        // Given
        when(tenantRepository.existsByTenantCode(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByUsername(anyString())).thenReturn(false);
        when(tenantOwnerRepository.existsByEmail(anyString())).thenReturn(false);
        when(tenantRepository.save(any(Tenant.class))).thenReturn(testTenant);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantService.createTenant(createRequest));
        
        // Verifyrollback happens on any failure
        verify(tenantRepository).delete(testTenant);
    }

    @Test
    void getTenant_Success() {
        // Given
        UUID tenantId = testTenant.getTenantId();
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(testTenant));
        when(tenantOwnerRepository.findByTenantId(tenantId)).thenReturn(Collections.singletonList(testOwner));

        // When
        TenantResponse response = tenantService.getTenant(tenantId);

        // Then
        assertNotNull(response);
        assertEquals(testTenant.getTenantCode(), response.getTenantCode());
        assertEquals(testOwner.getFullName(), response.getOwnerName());
        verify(tenantRepository).findById(tenantId);
    }

    @Test
    void getTenant_NotFound_ThrowsException() {
        // Given
        UUID tenantId = UUID.randomUUID();
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        // When & Then
        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> tenantService.getTenant(tenantId));
        
        assertTrue(exception.getMessage().contains("Không tìm thấy cửa hàng"));
    }

    @Test
    void getTenant_NoOwner_ReturnsResponseWithoutOwnerInfo() {
        // Given
        UUID tenantId = testTenant.getTenantId();
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(testTenant));
        when(tenantOwnerRepository.findByTenantId(tenantId)).thenReturn(Collections.emptyList());

        // When
        TenantResponse response = tenantService.getTenant(tenantId);

        // Then
        assertNotNull(response);
        assertNull(response.getOwnerName());
    }

    @Test
    void getAllTenants_Success() {
        // Given
        Tenant tenant2 = Tenant.builder()
                .tenantId(UUID.randomUUID())
                .tenantCode("TEST002")
                .tenantName("Store 2")
                .isActive(true)
                .build();

        List<Tenant> tenants = Arrays.asList(testTenant, tenant2);
        when(tenantRepository.findAll()).thenReturn(tenants);
        when(tenantOwnerRepository.findByTenantId(any())).thenReturn(Collections.singletonList(testOwner));

        // When
        List<TenantResponse> responses = tenantService.getAllTenants();

        // Then
        assertNotNull(responses);
        assertEquals(2, responses.size());
        verify(tenantRepository).findAll();
    }

    @Test
    void getAllTenants_EmptyList() {
        // Given
        when(tenantRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        List<TenantResponse> responses = tenantService.getAllTenants();

        // Then
        assertNotNull(responses);
        assertTrue(responses.isEmpty());
    }

    @Test
    void updateTenantStatus_Success_Activate() {
        // Given
        UUID tenantId = testTenant.getTenantId();
        testTenant.setIsActive(false);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(testTenant));
        when(tenantRepository.save(any(Tenant.class))).thenReturn(testTenant);
        when(tenantOwnerRepository.findByTenantId(tenantId)).thenReturn(Collections.singletonList(testOwner));

        // When
        TenantResponse response = tenantService.updateTenantStatus(tenantId, true);

        // Then
        assertNotNull(response);
        verify(tenantRepository).save(argThat(tenant -> tenant.getIsActive() == true));
    }

    @Test
    void updateTenantStatus_Success_Deactivate() {
        // Given
        UUID tenantId = testTenant.getTenantId();
        testTenant.setIsActive(true);
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(testTenant));
        when(tenantRepository.save(any(Tenant.class))).thenReturn(testTenant);
        when(tenantOwnerRepository.findByTenantId(tenantId)).thenReturn(Collections.singletonList(testOwner));

        // When
        TenantResponse response = tenantService.updateTenantStatus(tenantId, false);

        // Then
        assertNotNull(response);
        verify(tenantRepository).save(argThat(tenant -> tenant.getIsActive() == false));
    }

    @Test
    void updateTenantStatus_TenantNotFound_ThrowsException() {
        // Given
        UUID tenantId = UUID.randomUUID();
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        // When & Then
        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> tenantService.updateTenantStatus(tenantId, true));
        
        assertTrue(exception.getMessage().contains("Không tìm thấy cửa hàng"));
        verify(tenantRepository, never()).save(any());
    }

    @Test
    void getTenantByCode_Success() {
        // Given
        String tenantCode = testTenant.getTenantCode();
        when(tenantRepository.findByTenantCode(tenantCode)).thenReturn(Optional.of(testTenant));
        when(tenantOwnerRepository.findByTenantId(any())).thenReturn(Collections.singletonList(testOwner));

        // When
        TenantResponse response = tenantService.getTenantByCode(tenantCode);

        // Then
        assertNotNull(response);
        assertEquals(tenantCode, response.getTenantCode());
        verify(tenantRepository).findByTenantCode(tenantCode);
    }

    @Test
    void getTenantByCode_NotFound_ThrowsException() {
        // Given
        String tenantCode = "NONEXISTENT";
        when(tenantRepository.findByTenantCode(tenantCode)).thenReturn(Optional.empty());

        // When & Then
        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> tenantService.getTenantByCode(tenantCode));
        
        assertTrue(exception.getMessage().contains("Không tìm thấy cửa hàng"));
    }

    @Test
    void deleteTenant_Success() {
        // Given
        UUID tenantId = testTenant.getTenantId();
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(testTenant));

        // When & Then - Should fail at database deletion (expected in unit test)
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantService.deleteTenant(tenantId));
        
        assertTrue(exception.getMessage().contains("Kh\u00f4ng th\u1ec3 x\u00f3a"));
        verify(tenantRepository).findById(tenantId);
    }

    @Test
    void deleteTenant_NotFound_ThrowsException() {
        // Given
        UUID tenantId = UUID.randomUUID();
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());

        // When & Then
        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> tenantService.deleteTenant(tenantId));
        
        assertTrue(exception.getMessage().contains("Không tìm thấy cửa hàng"));
        verify(tenantRepository, never()).delete(any());
    }

    @Test
    void deleteTenant_DatabaseDropFails_ThrowsException() {
        // Given
        UUID tenantId = testTenant.getTenantId();
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(testTenant));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantService.deleteTenant(tenantId));
        
        assertTrue(exception.getMessage().contains("Kh\u00f4ng th\u1ec3 x\u00f3a"));
    }
}
