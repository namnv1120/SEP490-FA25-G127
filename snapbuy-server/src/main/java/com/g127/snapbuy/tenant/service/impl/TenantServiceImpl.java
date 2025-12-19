package com.g127.snapbuy.tenant.service.impl;

import com.g127.snapbuy.admin.service.MasterRoleService;
import com.g127.snapbuy.tenant.config.TenantFlywayRunner;
import com.g127.snapbuy.tenant.config.TenantRoutingDataSource;
import com.g127.snapbuy.tenant.context.TenantContext;
import com.g127.snapbuy.tenant.dto.request.TenantCreateRequest;
import com.g127.snapbuy.tenant.dto.request.TenantUpdateRequest;
import com.g127.snapbuy.tenant.dto.response.TenantResponse;
import com.g127.snapbuy.tenant.entity.Tenant;
import com.g127.snapbuy.tenant.entity.TenantOwner;
import com.g127.snapbuy.tenant.repository.TenantOwnerRepository;
import com.g127.snapbuy.tenant.repository.TenantRepository;
import com.g127.snapbuy.tenant.service.TenantService;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TenantServiceImpl implements TenantService {

    private final TenantRepository tenantRepository;
    private final TenantOwnerRepository tenantOwnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource tenantDataSource;
    private final TenantFlywayRunner flywayRunner;
    private final MasterRoleService masterRoleService;
    
    private TenantRoutingDataSource tenantRoutingDataSource;
    
    public TenantServiceImpl(
            TenantRepository tenantRepository,
            TenantOwnerRepository tenantOwnerRepository,
            PasswordEncoder passwordEncoder,
            @Qualifier("tenantDataSource") DataSource tenantDataSource,
            TenantFlywayRunner flywayRunner,
            MasterRoleService masterRoleService) {
        this.tenantRepository = tenantRepository;
        this.tenantOwnerRepository = tenantOwnerRepository;
        this.passwordEncoder = passwordEncoder;
        this.tenantDataSource = tenantDataSource;
        this.masterRoleService = masterRoleService;
        this.flywayRunner = flywayRunner;
    }

    @PostConstruct
    public void loadAllTenantDataSources() {
        // Chuyển đổi DataSource thành TenantRoutingDataSource
        this.tenantRoutingDataSource = (TenantRoutingDataSource) tenantDataSource;
        
        List<Tenant> tenants = tenantRepository.findAll();
        int successCount = 0;
        
        for (Tenant tenant : tenants) {
            if (tenant.getIsActive()) {
                try {
                    HikariDataSource dataSource = createDataSource(tenant);
                    String tenantIdStr = tenant.getTenantId().toString();
                    tenantRoutingDataSource.addTenantDataSource(tenantIdStr, dataSource);
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to load datasource for tenant: {} (dbName={}) - {}", 
                            tenant.getTenantCode(), tenant.getDbName(), e.getMessage(), e);
                }
            }
        }
        
        log.info("Loaded {} tenant datasources", successCount);
    }
    
    private HikariDataSource createDataSource(Tenant tenant) {
        String jdbcUrl = String.format(
                "jdbc:sqlserver://%s:%d;databaseName=%s;encrypt=false;trustServerCertificate=true",
                tenant.getDbHost(), tenant.getDbPort(), tenant.getDbName()
        );
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(tenant.getDbUsername());
        config.setPassword(tenant.getDbPassword());
        config.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        
        return new HikariDataSource(config);
    }

    @Override
    @Transactional("masterTransactionManager")
    public TenantResponse createTenant(TenantCreateRequest request) {

        // Kiểm tra mã cửa hàng có bị trùng không
        if (tenantRepository.existsByTenantCode(request.getTenantCode())) {
            throw new IllegalArgumentException("Mã cửa hàng '" + request.getTenantCode() + "' đã được sử dụng. Vui lòng chọn mã khác.");
        }
        
        // Kiểm tra tên đăng nhập chủ cửa hàng có bị trùng không
        if (tenantOwnerRepository.existsByUsername(request.getOwnerUsername())) {
            throw new IllegalArgumentException("Tên đăng nhập '" + request.getOwnerUsername() + "' đã tồn tại. Vui lòng chọn tên khác.");
        }
        
        // Kiểm tra email chủ cửa hàng có bị trùng không
        if (tenantOwnerRepository.existsByEmail(request.getOwnerEmail())) {
            throw new IllegalArgumentException("Email '" + request.getOwnerEmail() + "' đã được đăng ký. Vui lòng sử dụng email khác.");
        }
        
        // Kiểm tra số điện thoại chủ cửa hàng có bị trùng không (nếu có)
        if (request.getOwnerPhone() != null && !request.getOwnerPhone().isEmpty()) {
            if (tenantOwnerRepository.existsByPhone(request.getOwnerPhone())) {
                throw new IllegalArgumentException("Số điện thoại '" + request.getOwnerPhone() + "' đã được đăng ký. Vui lòng sử dụng số khác.");
            }
        }

        // Tạo tenant với dbName tự động nếu không được cung cấp
        String dbName = (request.getDbName() != null && !request.getDbName().isBlank()) 
            ? request.getDbName() 
            : null; // Will be set after save when we have tenantId
        
        Tenant tenant = Tenant.builder()
                .tenantName(request.getTenantName())
                .tenantCode(request.getTenantCode())
                .dbHost(request.getDbHost())
                .dbPort(request.getDbPort())
                .dbName(dbName)
                .dbUsername(request.getDbUsername())
                .dbPassword(request.getDbPassword())
                .isActive(true)
                .subscriptionStart(LocalDateTime.now())
                .maxUsers(request.getMaxUsers())
                .maxProducts(request.getMaxProducts())
                .build();

        tenant = tenantRepository.save(tenant);
        
        // Auto-generate dbName from tenantId if not provided
        if (dbName == null) {
            String generatedDbName = "SnapBuy_" + tenant.getTenantId().toString().replace("-", "");
            tenant.setDbName(generatedDbName);
            tenant = tenantRepository.save(tenant);
        }

        // Tạo database cho tenant và thiết lập datasource
        try {
            createTenantDatabase(tenant);
            setupTenantDataSource(tenant);
            
            // Chạy Flyway migrations cho database tenant
            flywayRunner.runMigrations(tenant.getTenantId().toString());
            log.debug("Tenant database setup completed with migrations");
            
            // Đồng bộ vai trò từ master sang database tenant
            masterRoleService.syncRolesToTenant(tenant.getTenantId().toString());
            log.debug("Master roles synced to tenant database");
        } catch (IllegalArgumentException e) {
            // Ném lại lỗi validation (database đã tồn tại, v.v.)
            log.error("Validation error during tenant setup: {}", e.getMessage());
            // Rollback: Xóa tenant khỏi Master DB
            tenantRepository.delete(tenant);
            throw e;
        } catch (Exception e) {
            log.error("Failed to setup tenant database: {}", e.getMessage(), e);
            // Rollback: Xóa tenant khỏi Master DB
            tenantRepository.delete(tenant);
            throw new RuntimeException("Không thể tạo cơ sở dữ liệu cho cửa hàng: " + e.getMessage());
        }

        // Tạo tài khoản chủ cửa hàng trong Master DB
        TenantOwner owner = TenantOwner.builder()
                .tenantId(tenant.getTenantId())
                .username(request.getOwnerUsername())
                .passwordHash(passwordEncoder.encode(request.getOwnerPassword()))
                .fullName(request.getOwnerFullName())
                .email(request.getOwnerEmail())
                .phone(request.getOwnerPhone())
                .isActive(true)
                .build();

        owner = tenantOwnerRepository.save(owner);
        log.debug("Tenant owner created in Master DB with ID: {}", owner.getAccountId());

        // Chèn tài khoản chủ cửa hàng vào Tenant DB
        try {
            insertOwnerIntoTenantDB(tenant, request);
            log.debug("Owner account inserted into Tenant DB");
        } catch (Exception e) {
            log.error("Failed to insert owner into tenant DB: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo tài khoản chủ cửa hàng: " + e.getMessage());
        }

        return toResponse(tenant, owner);
    }

    @Override
    @Transactional(value = "masterTransactionManager", readOnly = true)
    public TenantResponse getTenant(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cửa hàng"));
        
        TenantOwner owner = tenantOwnerRepository.findByTenantId(tenantId).stream()
                .findFirst()
                .orElse(null);
        
        return toResponse(tenant, owner);
    }

    @Override
    @Transactional(value = "masterTransactionManager", readOnly = true)
    public List<TenantResponse> getAllTenants() {
        List<Tenant> tenants = tenantRepository.findAll();
        return tenants.stream()
                .map(tenant -> {
                    TenantOwner owner = tenantOwnerRepository.findByTenantId(tenant.getTenantId())
                            .stream().findFirst().orElse(null);
                    return toResponse(tenant, owner);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional("masterTransactionManager")
    public TenantResponse updateTenantStatus(UUID tenantId, Boolean isActive) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cửa hàng"));
        
        tenant.setIsActive(isActive);
        tenant = tenantRepository.save(tenant);
        
        TenantOwner owner = tenantOwnerRepository.findByTenantId(tenantId).stream()
                .findFirst()
                .orElse(null);
        
        return toResponse(tenant, owner);
    }

    @Override
    @Transactional("masterTransactionManager")
    public TenantResponse updateTenant(UUID tenantId, TenantUpdateRequest request) {
        // Lấy tenant từ master database
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cửa hàng"));
        
        // Cập nhật tên tenant
        tenant.setTenantName(request.getTenantName());
        tenant = tenantRepository.save(tenant);
        
        // Lấy và cập nhật thông tin chủ cửa hàng trong master database
        TenantOwner owner = tenantOwnerRepository.findByTenantId(tenantId).stream()
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy thông tin chủ cửa hàng"));
        
        owner.setFullName(request.getOwnerFullName());
        owner.setEmail(request.getOwnerEmail());
        owner.setPhone(request.getOwnerPhone());
        tenantOwnerRepository.save(owner);
        
        // Cập nhật thông tin chủ cửa hàng trong tenant database
        try {
            String tenantIdStr = tenant.getTenantId().toString();
            TenantContext.setCurrentTenant(tenantIdStr);
            
            DataSource tenantDataSource = tenantRoutingDataSource.getResolvedDataSources().get(tenantIdStr);
            if (tenantDataSource != null) {
                try (Connection conn = tenantDataSource.getConnection();
                     PreparedStatement stmt = conn.prepareStatement(
                             "UPDATE accounts SET full_name = ?, email = ?, phone = ? WHERE username = ?")) {
                    
                    stmt.setString(1, request.getOwnerFullName());
                    stmt.setString(2, request.getOwnerEmail());
                    stmt.setString(3, request.getOwnerPhone());
                    stmt.setString(4, owner.getUsername());
                    stmt.executeUpdate();
                }
            }
        } catch (SQLException e) {
            log.error("Failed to update owner in tenant database: {}", e.getMessage());
            // Tiếp tục ngay cả khi cập nhật tenant DB thất bại
        } finally {
            TenantContext.clear();
        }
        
        return toResponse(tenant, owner);
    }


    @Override
    @Transactional("masterTransactionManager")
    public void deleteTenant(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cửa hàng"));
        
        String dbName = tenant.getDbName();
        String tenantIdStr = tenantId.toString();
        
        try {
            // Bước 1: Xóa datasource khỏi routing pool
            if (tenantRoutingDataSource != null) {
                tenantRoutingDataSource.removeTenantDataSource(tenantIdStr);
                log.info("Removed datasource for tenant: {}", tenantIdStr);
            }
            
            // Bước 2: Xóa database tenant
            dropTenantDatabase(tenant);
            log.info("Dropped database: {}", dbName);
            
            // Bước 3: Xóa bản ghi tenant khỏi master DB (cascade sẽ xóa owner)
            tenantRepository.deleteById(tenantId);

        } catch (Exception e) {
            log.error("Error deleting tenant {}: {}", tenantId, e.getMessage(), e);
            throw new RuntimeException("Không thể xóa cửa hàng: " + e.getMessage(), e);
        }
    }
    
    /**
     * Xóa database tenant
     */
    private void dropTenantDatabase(Tenant tenant) throws Exception {
        String masterUrl = String.format(
                "jdbc:sqlserver://%s:%d;databaseName=master;encrypt=false;trustServerCertificate=true",
                tenant.getDbHost(), tenant.getDbPort()
        );

        try (Connection conn = DriverManager.getConnection(
                masterUrl, tenant.getDbUsername(), tenant.getDbPassword());
             Statement stmt = conn.createStatement()) {

            // Ngắt tất cả kết nối đến database trước khi xóa
            String killConnectionsQuery = String.format(
                    "ALTER DATABASE [%s] SET SINGLE_USER WITH ROLLBACK IMMEDIATE",
                    tenant.getDbName()
            );
            
            try {
                stmt.executeUpdate(killConnectionsQuery);
                log.debug("Terminated all connections to database: {}", tenant.getDbName());
            } catch (Exception e) {
                log.warn("Could not set database to single user mode: {}", e.getMessage());
                // Tiếp tục dù sao - database có thể không tồn tại
            }
            
            // Xóa database
            String dropQuery = String.format("DROP DATABASE IF EXISTS [%s]", tenant.getDbName());
            stmt.executeUpdate(dropQuery);
            log.debug("Database '{}' dropped successfully", tenant.getDbName());
            
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            throw new RuntimeException("Lỗi khi xóa cơ sở dữ liệu: " + errorMsg, e);
        }
    }

    @Override
    @Transactional(value = "masterTransactionManager", readOnly = true)
    public TenantResponse getTenantByCode(String tenantCode) {
        Tenant tenant = tenantRepository.findByTenantCode(tenantCode)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cửa hàng"));
        
        TenantOwner owner = tenantOwnerRepository.findByTenantId(tenant.getTenantId()).stream()
                .findFirst()
                .orElse(null);
        
        return toResponse(tenant, owner);
    }

    /**
     * Create tenant database
     */
    private void createTenantDatabase(Tenant tenant) throws Exception {
        String masterUrl = String.format(
                "jdbc:sqlserver://%s:%d;databaseName=master;encrypt=false;trustServerCertificate=true",
                tenant.getDbHost(), tenant.getDbPort()
        );

        try (Connection conn = DriverManager.getConnection(
                masterUrl, tenant.getDbUsername(), tenant.getDbPassword());
             Statement stmt = conn.createStatement()) {

            // Kiểm tra xem database đã tồn tại chưa
            String checkQuery = String.format(
                    "SELECT database_id FROM sys.databases WHERE name = '%s'",
                    tenant.getDbName()
            );
            ResultSet rs = stmt.executeQuery(checkQuery);

            if (rs.next()) {
                log.debug("Database '{}' already exists", tenant.getDbName());
                throw new IllegalArgumentException("Cơ sở dữ liệu '" + tenant.getDbName() + "' đã tồn tại. Vui lòng sử dụng tên khác.");
            } else {
                log.debug("Creating database '{}'...", tenant.getDbName());
                String createQuery = String.format("CREATE DATABASE %s", tenant.getDbName());
                stmt.executeUpdate(createQuery);
                log.debug("Database '{}' created successfully", tenant.getDbName());
            }
            rs.close();
        } catch (IllegalArgumentException e) {
            // Re-throw validation errors
            throw e;
        } catch (Exception e) {
            // Bắt lỗi SQL
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.toLowerCase().contains("already exists")) {
                throw new IllegalArgumentException("Cơ sở dữ liệu '" + tenant.getDbName() + "' đã tồn tại. Vui lòng sử dụng tên khác.");
            }
            throw new RuntimeException("Lỗi khi tạo cơ sở dữ liệu: " + errorMsg, e);
        }
    }

    /**
     * Thiết lập datasource cho tenant và thêm vào routing datasource
     */
    private void setupTenantDataSource(Tenant tenant) {
        HikariDataSource dataSource = createDataSource(tenant);
        tenantRoutingDataSource.addTenantDataSource(tenant.getTenantId().toString(), dataSource);
    }

    /**
     * Chèn tài khoản chủ cửa hàng vào database tenant
     */
    private void insertOwnerIntoTenantDB(Tenant tenant, TenantCreateRequest request) throws Exception {
        String previousTenant = TenantContext.getCurrentTenant();
        
        try {
            // Thiết lập tenant context
            TenantContext.setCurrentTenant(tenant.getTenantId().toString());
            
            // Lấy datasource của tenant
            javax.sql.DataSource dataSource = tenantRoutingDataSource.getCurrentDataSource();
            
            try (Connection connection = dataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                
                // Mã hóa mật khẩu
                String hashedPassword = passwordEncoder.encode(request.getOwnerPassword());
                
                // Lấy ID của vai trò "Chủ cửa hàng"
                String getRoleIdQuery = "SELECT role_id FROM roles WHERE role_name = N'Chủ cửa hàng'";
                ResultSet rs = statement.executeQuery(getRoleIdQuery);
                
                if (!rs.next()) {
                    throw new RuntimeException("Không tìm thấy role 'Chủ cửa hàng' trong tenant database");
                }
                String roleId = rs.getString("role_id");
                rs.close();
                
                // Chèn tài khoản chủ cửa hàng
                String insertAccountSql = String.format(
                    "INSERT INTO accounts (full_name, username, password_hash, email, phone, active) " +
                    "VALUES (N'%s', '%s', '%s', '%s', '%s', 1)",
                    request.getOwnerFullName().replace("'", "''"),
                    request.getOwnerUsername(),
                    hashedPassword.replace("'", "''"),
                    request.getOwnerEmail(),
                    request.getOwnerPhone() != null ? request.getOwnerPhone() : ""
                );
                
                try {
                    statement.executeUpdate(insertAccountSql);
                    log.debug("Owner account inserted into tenant DB");
                } catch (SQLException e) {
                    if (e.getMessage().contains("UX_accounts_phone")) {
                        throw new IllegalArgumentException("Số điện thoại '" + request.getOwnerPhone() + "' đã được sử dụng trong hệ thống. Vui lòng sử dụng số khác.");
                    } else if (e.getMessage().contains("UX_accounts_username")) {
                        throw new IllegalArgumentException("Tên đăng nhập '" + request.getOwnerUsername() + "' đã tồn tại. Vui lòng chọn tên khác.");
                    } else if (e.getMessage().contains("UX_accounts_email")) {
                        throw new IllegalArgumentException("Email '" + request.getOwnerEmail() + "' đã được đăng ký. Vui lòng sử dụng email khác.");
                    }
                    throw e;
                }
                
                // Lấy account_id vừa được tạo
                String getAccountIdQuery = String.format(
                    "SELECT account_id FROM accounts WHERE username = '%s'",
                    request.getOwnerUsername()
                );
                rs = statement.executeQuery(getAccountIdQuery);
                
                if (!rs.next()) {
                    throw new RuntimeException("Không tìm thấy account vừa tạo");
                }
                String accountId = rs.getString("account_id");
                rs.close();
                
                // Gán vai trò "Chủ cửa hàng" cho chủ cửa hàng
                String insertRoleSql = String.format(
                    "INSERT INTO account_roles (account_id, role_id) VALUES ('%s', '%s')",
                    accountId, roleId
                );
                statement.executeUpdate(insertRoleSql);
                log.debug("Role 'Chủ cửa hàng' assigned to owner account");
            }
        } finally {
            // Khôi phục tenant context trước đó
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }

    private TenantResponse toResponse(Tenant tenant, TenantOwner owner) {
        // Tính toán thống kê từ database tenant
        int userCount = countUsersInTenant(tenant.getTenantId().toString());
        int productCount = countProductsInTenant(tenant.getTenantId().toString());
        long revenue = calculateRevenueInTenant(tenant.getTenantId().toString());
        
        return TenantResponse.builder()
                .tenantId(tenant.getTenantId().toString())
                .tenantName(tenant.getTenantName())
                .tenantCode(tenant.getTenantCode())
                .dbName(tenant.getDbName())
                .isActive(tenant.getIsActive())
                .createdAt(tenant.getCreatedAt())
                .createdDate(tenant.getCreatedAt())
                .subscriptionStart(tenant.getSubscriptionStart())
                .subscriptionEnd(tenant.getSubscriptionEnd())
                .maxUsers(tenant.getMaxUsers())
                .maxProducts(tenant.getMaxProducts())
                .ownerName(owner != null ? owner.getFullName() : null)
                .ownerEmail(owner != null ? owner.getEmail() : null)
                .ownerPhone(owner != null ? owner.getPhone() : null)
                .storeName(tenant.getTenantName())
                .userCount(userCount)
                .productCount(productCount)
                .revenue(revenue)
                .build();
    }
    
    /**
     * Đếm số lượng người dùng trong database tenant
     */
    private int countUsersInTenant(String tenantId) {
        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant(tenantId);
            
            javax.sql.DataSource dataSource = tenantRoutingDataSource.getCurrentDataSource();
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                String query = "SELECT COUNT(*) as count FROM accounts WHERE active = 1";
                ResultSet rs = stmt.executeQuery(query);
                
                if (rs.next()) {
                    int count = rs.getInt("count");
                    return count;
                }
                return 0;
            }
        } catch (Exception e) {
            log.error("Error counting users for tenant {}: {}", tenantId, e.getMessage(), e);
            return 0;
        } finally {
            if (previousTenant != null) {
                com.g127.snapbuy.tenant.context.TenantContext.setCurrentTenant(previousTenant);
            } else {
                com.g127.snapbuy.tenant.context.TenantContext.clear();
            }
        }
    }
    
    /**
     * Đếm số lượng sản phẩm trong database tenant
     */
    private int countProductsInTenant(String tenantId) {
        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant(tenantId);
            
            javax.sql.DataSource dataSource = tenantRoutingDataSource.getCurrentDataSource();
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                String query = "SELECT COUNT(*) as count FROM products";
                ResultSet rs = stmt.executeQuery(query);
                
                if (rs.next()) {
                    int count = rs.getInt("count");
                    return count;
                }
                return 0;
            }
        } catch (Exception e) {
            log.error("Error counting products for tenant {}: {}", tenantId, e.getMessage(), e);
            return 0;
        } finally {
            if (previousTenant != null) {
                com.g127.snapbuy.tenant.context.TenantContext.setCurrentTenant(previousTenant);
            } else {
                com.g127.snapbuy.tenant.context.TenantContext.clear();
            }
        }
    }
    
    /**
     * Tính tổng doanh thu trong database tenant
     */
    private long calculateRevenueInTenant(String tenantId) {
        String previousTenant = TenantContext.getCurrentTenant();
        try {
            TenantContext.setCurrentTenant(tenantId);
            
            javax.sql.DataSource dataSource = tenantRoutingDataSource.getCurrentDataSource();
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                // Tính tổng từ tất cả đơn hàng (sử dụng cột order_status)
                String query = "SELECT ISNULL(SUM(total_amount), 0) as total FROM orders";
                ResultSet rs = stmt.executeQuery(query);
                
                if (rs.next()) {
                    long revenue = rs.getLong("total");
                    return revenue;
                }
                return 0L;
            }
        } catch (Exception e) {
            log.error("Error calculating revenue for tenant {}: {}", tenantId, e.getMessage(), e);
            return 0L;
        } finally {
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }
}
