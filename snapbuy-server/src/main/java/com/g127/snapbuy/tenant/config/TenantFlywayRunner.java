package com.g127.snapbuy.tenant.config;

import com.g127.snapbuy.tenant.context.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Manual Flyway runner for tenant databases
 * Run this after creating tenant and setting tenant context
 */
@Slf4j
@Component
public class TenantFlywayRunner {

    private final TenantRoutingDataSource tenantDataSource;

    public TenantFlywayRunner(@Qualifier("tenantDataSource") DataSource tenantDataSource) {
        this.tenantDataSource = (TenantRoutingDataSource) tenantDataSource;
    }

    /**
     * Run Flyway migrations for current tenant
     * Call this after setting TenantContext
     */
    public void runMigrations(String tenantId) {
        try {
            // Set tenant context temporarily
            String previousTenant = TenantContext.getCurrentTenant();
            TenantContext.setCurrentTenant(tenantId);

            Flyway flyway = Flyway.configure()
                    .dataSource(tenantDataSource)
                    .locations("classpath:db/migration")
                    .baselineOnMigrate(true)
                    .load();

            var result = flyway.migrate();

            // Restore previous tenant context
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }

        } catch (Exception e) {
            log.error("Failed to run Flyway migrations for tenant {}: {}", tenantId, e.getMessage(), e);
            TenantContext.clear();
            throw new RuntimeException("Không thể chạy migrations cho tenant database: " + e.getMessage());
        }
    }
}
