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
     * Chèn dữ liệu mẫu vào database tenant hiện tại
     * @param tenantId ID của tenant cần chèn dữ liệu mẫu
     */
    @Transactional
    public void insertDemoData(String tenantId) {
        String previousTenant = TenantContext.getCurrentTenant();
        
        try {
            // Thiết lập tenant context
            TenantContext.setCurrentTenant(tenantId);
            log.info("Inserting demo data for tenant: {}", tenantId);

            // Đọc file SQL từ classpath
            ClassPathResource resource = new ClassPathResource("db/demo-data/demo_data.sql");
            String sqlScript;
            
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                sqlScript = reader.lines().collect(Collectors.joining("\n"));
            }

            // Thực thi script SQL
            DataSource dataSource = tenantRoutingDataSource.getCurrentDataSource();
            
            try (Connection connection = dataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                
                // Thực thi toàn bộ script (SQL Server có thể xử lý nhiều câu lệnh)
                statement.execute(sqlScript);
                
                log.info("Successfully inserted demo data for tenant: {}", tenantId);
            }
            
        } catch (Exception e) {
            log.error("Failed to insert demo data for tenant: {}", tenantId, e);
            throw new RuntimeException("Failed to insert demo data: " + e.getMessage(), e);
        } finally {
            // Khôi phục tenant context trước đó
            if (previousTenant != null) {
                TenantContext.setCurrentTenant(previousTenant);
            } else {
                TenantContext.clear();
            }
        }
    }

    /**
     * Kiểm tra xem database tenant đã có dữ liệu mẫu chưa
     * @param tenantId ID của tenant cần kiểm tra
     * @return true nếu dữ liệu mẫu tồn tại, false nếu không
     */
    public boolean hasDemoData(String tenantId) {
        String previousTenant = TenantContext.getCurrentTenant();
        
        try {
            TenantContext.setCurrentTenant(tenantId);
            
            DataSource dataSource = tenantRoutingDataSource.getCurrentDataSource();
            try (Connection connection = dataSource.getConnection();
                 Statement statement = connection.createStatement()) {
                
                // Kiểm tra xem tài khoản demo có tồn tại không (warehouse hoặc sales, không phải owner)
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
