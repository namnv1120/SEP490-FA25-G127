package com.g127.snapbuy.tenant.config;

import com.g127.snapbuy.tenant.context.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Flyway runner thủ công cho các database tenant
 * Chạy sau khi tạo tenant và thiết lập tenant context
 */
@Slf4j
@Component
public class TenantFlywayRunner {

    private final TenantRoutingDataSource tenantDataSource;

    public TenantFlywayRunner(@Qualifier("tenantDataSource") DataSource tenantDataSource) {
        this.tenantDataSource = (TenantRoutingDataSource) tenantDataSource;
    }

    /**
     * Chạy Flyway migrations cho tenant hiện tại
     * Gọi sau khi thiết lập TenantContext
     */
    public void runMigrations(String tenantId) {
        try {
            // Thiết lập tenant context tạm thời
            String previousTenant = TenantContext.getCurrentTenant();
            TenantContext.setCurrentTenant(tenantId);

            Flyway flyway = Flyway.configure()
                    .dataSource(tenantDataSource)
                    .locations("classpath:db/migration")
                    .baselineOnMigrate(true)
                    .load();

            var result = flyway.migrate();

            // Khôi phục tenant context trước đó
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
