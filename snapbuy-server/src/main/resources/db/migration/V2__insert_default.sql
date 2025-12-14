-- Multi-tenancy: Insert only essential default data for tenant database
-- Real tenant owner account will be created during tenant registration

-- NOTE: Roles are managed centrally in master database and synced automatically
-- via MasterRoleService.syncRolesToTenant() when tenant is created

-- Insert default walk-in customer (REQUIRED for POS system)
INSERT INTO customers (customer_id, customer_code, full_name, phone, active)
VALUES ('00000000-0000-0000-0000-000000000001',
        'DEFAULT',
        N'Khách lẻ',
        N'Khách lẻ',
        1);
