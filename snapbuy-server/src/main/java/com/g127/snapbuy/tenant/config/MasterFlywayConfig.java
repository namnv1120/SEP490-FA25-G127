package com.g127.snapbuy.tenant.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.flyway.FlywayProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Slf4j
@Configuration
public class MasterFlywayConfig {

    @Bean
    @ConfigurationProperties(prefix = "master.flyway")
    public FlywayProperties masterFlywayProperties() {
        return new FlywayProperties();
    }

    @Bean(initMethod = "migrate")
    @org.springframework.context.annotation.DependsOn("databaseInitializer")
    public Flyway masterFlyway(@Qualifier("masterDataSource") DataSource masterDataSource,
                                FlywayProperties masterFlywayProperties) {
        
        log.debug("Configuring Flyway for Master database...");
        
        Flyway flyway = Flyway.configure()
                .dataSource(masterDataSource)
                .locations(masterFlywayProperties.getLocations().toArray(new String[0]))
                .baselineOnMigrate(masterFlywayProperties.isBaselineOnMigrate())
                .load();
        
        log.debug("Running Flyway migrations for Master database...");
        flyway.migrate();
        log.debug("Master database migrations completed successfully");
        
        return flyway;
    }
}
