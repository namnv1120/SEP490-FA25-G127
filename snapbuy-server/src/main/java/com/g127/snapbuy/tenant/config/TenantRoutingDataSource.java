package com.g127.snapbuy.tenant.config;

import com.g127.snapbuy.tenant.context.TenantContext;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

public class TenantRoutingDataSource extends AbstractRoutingDataSource {
    
    private final Map<Object, Object> targetDataSources = new HashMap<>();
    
    public TenantRoutingDataSource() {
        super();
        super.setTargetDataSources(this.targetDataSources);
    }
    
    @Override
    protected Object determineCurrentLookupKey() {
        return TenantContext.getCurrentTenant();
    }
    
    @Override
    protected DataSource determineTargetDataSource() {
        Object lookupKey = determineCurrentLookupKey();
        if (lookupKey != null && !targetDataSources.containsKey(lookupKey)) {
            throw new IllegalStateException(
                "Không tìm thấy cơ sở dữ liệu cho cửa hàng với mã: " + lookupKey + 
                ". Vui lòng liên hệ quản trị viên hệ thống."
            );
        }
        return super.determineTargetDataSource();
    }
    
    public void addTenantDataSource(String tenantId, DataSource dataSource) {
        this.targetDataSources.put(tenantId, dataSource);
        super.setTargetDataSources(this.targetDataSources);
        super.afterPropertiesSet();
    }
    
    public void removeTenantDataSource(String tenantId) {
        this.targetDataSources.remove(tenantId);
        super.setTargetDataSources(this.targetDataSources);
        super.afterPropertiesSet();
    }
    
    public DataSource getCurrentDataSource() {
        return determineTargetDataSource();
    }
}
