package com.g127.snapbuy.tenant.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableJpaRepositories(
    basePackages = {
        "com.g127.snapbuy.account.repository",
        "com.g127.snapbuy.category.repository",
        "com.g127.snapbuy.customer.repository",
        "com.g127.snapbuy.inventory.repository",
        "com.g127.snapbuy.location.repository",
        "com.g127.snapbuy.notification.repository",
        "com.g127.snapbuy.order.repository",
        "com.g127.snapbuy.payment.repository",
        "com.g127.snapbuy.product.repository",
        "com.g127.snapbuy.promotion.repository",
        "com.g127.snapbuy.revenue.repository",
        "com.g127.snapbuy.settings.repository",
        "com.g127.snapbuy.shift.repository",
        "com.g127.snapbuy.supplier.repository"
    },
    entityManagerFactoryRef = "tenantEntityManagerFactory",
    transactionManagerRef = "tenantTransactionManager"
)
public class TenantDataSourceConfig {

    @Bean(name = "tenantDataSource")
    public DataSource tenantDataSource() {
        TenantRoutingDataSource routingDataSource = new TenantRoutingDataSource();
        // Set a dummy default datasource to avoid initialization error
        // Actual tenant datasources will be added dynamically when accessing tenant data
        routingDataSource.setLenientFallback(false); // Changed to false to detect routing issues
        routingDataSource.afterPropertiesSet();
        return routingDataSource;
    }

    @Bean(name = "tenantEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean tenantEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("tenantDataSource") DataSource dataSource) {
        
        Map<String, Object> properties = new HashMap<>();
        // Disable schema validation at startup for multi-tenancy
        properties.put("hibernate.hbm2ddl.auto", "none");
        properties.put("hibernate.temp.use_jdbc_metadata_defaults", false);
        properties.put("hibernate.jdbc.lob.non_contextual_creation", true);
        
        return builder
                .dataSource(dataSource)
                .packages(
                    "com.g127.snapbuy.account.entity",
                    "com.g127.snapbuy.category.entity",
                    "com.g127.snapbuy.customer.entity",
                    "com.g127.snapbuy.inventory.entity",
                    "com.g127.snapbuy.location.entity",
                    "com.g127.snapbuy.notification.entity",
                    "com.g127.snapbuy.order.entity",
                    "com.g127.snapbuy.payment.entity",
                    "com.g127.snapbuy.product.entity",
                    "com.g127.snapbuy.promotion.entity",
                    "com.g127.snapbuy.revenue.entity",
                    "com.g127.snapbuy.settings.entity",
                    "com.g127.snapbuy.shift.entity",
                    "com.g127.snapbuy.supplier.entity"
                )
                .persistenceUnit("tenant")
                .properties(properties)
                .build();
    }

    @Bean(name = "tenantTransactionManager")
    public PlatformTransactionManager tenantTransactionManager(
            @Qualifier("tenantEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
