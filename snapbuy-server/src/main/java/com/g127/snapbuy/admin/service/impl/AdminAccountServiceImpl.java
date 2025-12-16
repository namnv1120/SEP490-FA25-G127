package com.g127.snapbuy.admin.service.impl;

import com.g127.snapbuy.admin.dto.response.AdminAccountResponse;
import com.g127.snapbuy.admin.service.AdminAccountService;
import com.g127.snapbuy.tenant.context.TenantContext;
import com.g127.snapbuy.tenant.entity.Tenant;
import com.g127.snapbuy.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class AdminAccountServiceImpl implements AdminAccountService {

    private final TenantRepository tenantRepository;
    private final DataSource tenantDataSource;
    private final PasswordEncoder passwordEncoder;

    public AdminAccountServiceImpl(
            TenantRepository tenantRepository,
            @Qualifier("tenantDataSource") DataSource tenantDataSource,
            PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.tenantDataSource = tenantDataSource;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<AdminAccountResponse> getAllAccountsFromAllTenants() {
        return searchAccountsFromAllTenants(null, null, null);
    }

    @Override
    public List<AdminAccountResponse> searchAccountsFromAllTenants(String keyword, Boolean active, String role) {
        List<AdminAccountResponse> allAccounts = new ArrayList<>();
        List<Tenant> tenants = tenantRepository.findAll();

        for (Tenant tenant : tenants) {
            try {
                TenantContext.setCurrentTenant(tenant.getTenantId().toString());
                List<AdminAccountResponse> tenantAccounts = getAccountsFromTenant(tenant, keyword, active, role);
                allAccounts.addAll(tenantAccounts);
            } catch (Exception e) {
                log.error("Error fetching accounts from tenant {}: {}", tenant.getTenantCode(), e.getMessage());
            } finally {
                TenantContext.clear();
            }
        }

        return allAccounts;
    }

    @Override
    public void deleteAccountFromTenant(String tenantId, UUID accountId) {
        try {
            TenantContext.setCurrentTenant(tenantId);
            
            String sql = "DELETE FROM accounts WHERE account_id = ?";
            
            try (Connection conn = tenantDataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                
                stmt.setObject(1, accountId);
                int rowsAffected = stmt.executeUpdate();
                
                if (rowsAffected == 0) {
                    throw new RuntimeException("Account not found");
                }
                
                log.info("Deleted account {} from tenant {}", accountId, tenantId);
            }
        } catch (SQLException e) {
            log.error("Error deleting account from tenant: {}", e.getMessage());
            throw new RuntimeException("Failed to delete account", e);
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void updateAccount(String tenantId, UUID accountId, com.g127.snapbuy.admin.dto.request.AdminAccountUpdateRequest request) {
        try {
            TenantContext.setCurrentTenant(tenantId);
            
            // Build SQL dynamically based on whether password is being updated
            StringBuilder sql = new StringBuilder("UPDATE accounts SET full_name = ?, email = ?, phone = ?");
            boolean updatePassword = request.getNewPassword() != null && !request.getNewPassword().trim().isEmpty();
            
            if (updatePassword) {
                sql.append(", password_hash = ?");
            }
            
            sql.append(" WHERE account_id = ?");
            
            try (Connection conn = tenantDataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
                
                int paramIndex = 1;
                stmt.setString(paramIndex++, request.getFullName());
                stmt.setString(paramIndex++, request.getEmail());
                stmt.setString(paramIndex++, request.getPhone());
                
                if (updatePassword) {
                    String hashedPassword = passwordEncoder.encode(request.getNewPassword());
                    stmt.setString(paramIndex++, hashedPassword);
                }
                
                stmt.setObject(paramIndex, accountId);
                
                int rowsAffected = stmt.executeUpdate();
                
                if (rowsAffected == 0) {
                    throw new RuntimeException("Account not found");
                }
                
                log.info("Updated account {} in tenant {}{}", accountId, tenantId, 
                        updatePassword ? " (including password)" : "");
            }
        } catch (SQLException e) {
            log.error("Error updating account: {}", e.getMessage());
            throw new RuntimeException("Failed to update account", e);
        } finally {
            TenantContext.clear();
        }
    }


    @Override
    public void toggleAccountStatus(String tenantId, UUID accountId) {
        try {
            TenantContext.setCurrentTenant(tenantId);
            
            String sql = "UPDATE accounts SET active = CASE WHEN active = 1 THEN 0 ELSE 1 END WHERE account_id = ?";
            
            try (Connection conn = tenantDataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql)) {
                
                stmt.setObject(1, accountId);
                int rowsAffected = stmt.executeUpdate();
                
                if (rowsAffected == 0) {
                    throw new RuntimeException("Account not found");
                }
                
            }
        } catch (SQLException e) {
            log.error("Error toggling account status: {}", e.getMessage());
            throw new RuntimeException("Failed to toggle account status", e);
        } finally {
            TenantContext.clear();
        }
    }

    private List<AdminAccountResponse> getAccountsFromTenant(Tenant tenant, String keyword, Boolean active, String role) {
        List<AdminAccountResponse> accounts = new ArrayList<>();
        
        StringBuilder sql = new StringBuilder(
            "SELECT a.account_id, a.username, a.full_name, a.email, a.phone, a.active, a.created_date, a.updated_date, " +
            "r.role_name " +
            "FROM accounts a " +
            "LEFT JOIN account_roles ar ON a.account_id = ar.account_id " +
            "LEFT JOIN roles r ON ar.role_id = r.role_id " +
            "WHERE 1=1"
        );
        
        List<Object> params = new ArrayList<>();
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            sql.append(" AND (a.full_name LIKE ? OR a.email LIKE ? OR a.phone LIKE ?)");
            String searchPattern = "%" + keyword.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }
        
        if (active != null) {
            sql.append(" AND a.active = ?");
            params.add(active ? 1 : 0);
        }
        
        if (role != null && !role.trim().isEmpty()) {
            sql.append(" AND r.role_name = ?");
            params.add(role.trim());
        }
        
        try (Connection conn = tenantDataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    AdminAccountResponse account = AdminAccountResponse.builder()
                            .accountId(UUID.fromString(rs.getString("account_id")))
                            .username(rs.getString("username"))
                            .fullName(rs.getString("full_name"))
                            .email(rs.getString("email"))
                            .phone(rs.getString("phone"))
                            .roleName(rs.getString("role_name"))
                            .tenantId(tenant.getTenantId().toString())
                            .tenantName(tenant.getTenantName())
                            .active(rs.getInt("active") == 1)
                            .lastLogin(rs.getObject("updated_date", LocalDateTime.class))
                            .createdAt(rs.getObject("created_date", LocalDateTime.class))
                            .build();
                    accounts.add(account);
                }
            }
        } catch (SQLException e) {
            log.error("Error querying accounts from tenant {}: {}", tenant.getTenantCode(), e.getMessage());
        }
        
        return accounts;
    }
}
