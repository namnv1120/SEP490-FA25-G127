package com.g127.snapbuy.tenant.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Slf4j
@Component("databaseInitializer")
public class DatabaseInitializer {

    private static boolean initialized = false;

    @Value("${MASTER_DB_HOST:localhost}")
    private String masterHost;

    @Value("${MASTER_DB_PORT:1433}")
    private String masterPort;

    @Value("${MASTER_DB_NAME:SnapBuyMaster}")
    private String masterDbName;

    @Value("${MASTER_DB_USERNAME:sa}")
    private String masterUsername;

    @Value("${MASTER_DB_PASSWORD:123456}")
    private String masterPassword;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (!initialized) {
            createMasterDatabaseIfNotExists();
            initialized = true;
        }
    }

    private void createMasterDatabaseIfNotExists() {
        // Kết nối đến SQL Server master database (không phải database ứng dụng của chúng ta)
        String sqlServerMasterUrl = String.format(
                "jdbc:sqlserver://%s:%s;databaseName=master;encrypt=false;trustServerCertificate=true",
                masterHost, masterPort
        );

        try (Connection conn = DriverManager.getConnection(sqlServerMasterUrl, masterUsername, masterPassword);
             Statement stmt = conn.createStatement()) {

            // Kiểm tra xem database đã tồn tại chưa
            String checkDbQuery = String.format(
                    "SELECT database_id FROM sys.databases WHERE name = '%s'",
                    masterDbName
            );

            ResultSet rs = stmt.executeQuery(checkDbQuery);
            
            if (rs.next()) {
                log.info("Master database '{}' already exists", masterDbName);
            } else {
                // Tạo database
                log.info("Creating master database '{}'...", masterDbName);
                String createDbQuery = String.format("CREATE DATABASE %s", masterDbName);
                stmt.executeUpdate(createDbQuery);
                log.info("Master database '{}' created successfully", masterDbName);
            }
            
            rs.close();

        } catch (Exception e) {
            log.error("Error initializing master database: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize master database", e);
        }
    }
}
