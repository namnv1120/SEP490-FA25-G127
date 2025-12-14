-- Master Database Schema for Multi-Tenancy
-- This database manages all tenants (shops)

CREATE TABLE tenants (
    tenant_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_name NVARCHAR(255) NOT NULL,
    tenant_code VARCHAR(50) UNIQUE NOT NULL,
    db_host VARCHAR(255) NOT NULL DEFAULT 'localhost',
    db_port INT NOT NULL DEFAULT 1433,
    db_name VARCHAR(255) NOT NULL,
    db_username VARCHAR(255) NOT NULL,
    db_password VARCHAR(255) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NULL,
    subscription_start DATETIME NULL,
    subscription_end DATETIME NULL,
    max_users INT DEFAULT 10,
    max_products INT DEFAULT 1000,
    CONSTRAINT UQ_tenant_db_name UNIQUE(db_name)
);

CREATE TABLE admin_accounts (
    account_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_login DATETIME NULL
);

CREATE TABLE tenant_owners (
    account_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    tenant_id UNIQUEIDENTIFIER NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_login DATETIME NULL,
    CONSTRAINT FK_tenant_owner_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE TABLE master_roles (
    role_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    role_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    active BIT DEFAULT 1,
    created_date DATETIME DEFAULT GETDATE(),
    is_system_role BIT DEFAULT 0, -- Admin và Chủ cửa hàng là system roles
    display_order INT DEFAULT 0
);

CREATE INDEX IDX_tenants_code ON tenants(tenant_code);
CREATE INDEX IDX_tenants_active ON tenants(is_active);
CREATE INDEX IDX_tenant_owners_tenant ON tenant_owners(tenant_id);
