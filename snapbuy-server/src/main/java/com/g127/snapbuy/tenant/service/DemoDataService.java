package com.g127.snapbuy.tenant.service;

import com.g127.snapbuy.tenant.context.TenantContext;
import com.g127.snapbuy.tenant.config.TenantRoutingDataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Statement;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoDataService {

    private final TenantRoutingDataSource tenantRoutingDataSource;

    /**
     * Insert demo data into the current tenant database
     * @param tenantId The tenant ID to insert demo data for
     */
    @Transactional
    public void insertDemoData(String tenantId) {
        String previousTenant = TenantContext.getCurrentTenant();
        
        try {
            // Set tenant context
            TenantContext.setCurrentTenant(tenantId);
            log.info("Inserting demo data for tenant: {}", tenantId);

            // Read SQL file from classpath
            ClassPathResource resource = new ClassPathResource("db/demo-data/demo_data.sql");
            String sqlScript;
            
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                sqlScript = reader.lines().collect(Collectors.joining("\n"));
            }

            // Execute SQL script
            DataSource dataSource = tenantRoutingDataSource.getCurrentDataSource();
            
            try (Connection connection = dataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                
                // Execute the entire script (SQL Server can handle multiple statements)
                statement.execute(sqlScript);
                
                log.info("Successfully inserted demo data for tenant: {}", tenantId);
            }
            
        } catch (Exception e) {
            log.error("Failed to insert demo data for tenant: {}", tenantId, e);
            throw new RuntimeException("Failed to insert demo data: " + e.getMessage(), e);
        } finally {
            // Restore previous tenant context
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }

    /**
     * Check if tenant database already has demo data
     * @param tenantId The tenant ID to check
     * @return true if demo data exists, false otherwise
     */
    public boolean hasDemoData(String tenantId) {
        String previousTenant = TenantContext.getCurrentTenant();
        
        try {
            TenantContext.setCurrentTenant(tenantId);
            
            DataSource dataSource = tenantRoutingDataSource.getCurrentDataSource();
            try (Connection connection = dataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                
                // Check if demo account exists (warehouse or sales, not owner)
                var resultSet = statement.executeQuery(
                    "SELECT COUNT(*) FROM accounts WHERE username IN ('warehouse', 'sales')"
                );
                
                if (resultSet.next()) {
                    return resultSet.getInt(1) > 0;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("Failed to check demo data for tenant: {}", tenantId, e);
            return false;
        } finally {
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }
}
