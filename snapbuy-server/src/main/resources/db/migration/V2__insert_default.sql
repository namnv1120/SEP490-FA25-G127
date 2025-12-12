-- Multi-tenancy: Insert only essential default data for tenant database
-- Real tenant owner account will be created during tenant registration

-- Insert 3 tenant roles (NO ADMIN ROLE)
INSERT INTO roles (role_name, [description], active)
VALUES (N'Chủ cửa hàng', N'Chủ cửa hàng - Quản lý mọi hoạt động kinh doanh', 1),
       (N'Nhân viên kho', N'Nhân viên kho - Quản lý biên lai và các vấn đề liên quan đến hàng tồn kho', 1),
       (N'Nhân viên bán hàng', N'Nhân viên bán hàng - Xử lý đơn hàng và quản lý khách hàng', 1);


-- Insert all permissions
INSERT INTO [permissions] ([permission_name], [description], module, active)
VALUES
-- Product Management
    (N'VIEW_PRODUCT', N'View product list', N'PRODUCT', 1),
    (N'CREATE_PRODUCT', N'Add new product', N'PRODUCT', 1),
    (N'UPDATE_PRODUCT', N'Update product information', N'PRODUCT', 1),
    (N'DELETE_PRODUCT', N'Delete product', N'PRODUCT', 1),
    (N'IMPORT_PRODUCT', N'Import product list', N'PRODUCT', 1),
    (N'EXPORT_PRODUCT', N'Export product list', N'PRODUCT', 1),

-- Order Management
    (N'VIEW_ORDER', N'View order list', N'ORDER', 1),
    (N'CREATE_ORDER', N'Create new order', N'ORDER', 1),
    (N'UPDATE_ORDER', N'Update order', N'ORDER', 1),
    (N'DELETE_ORDER', N'Delete order', N'ORDER', 1),
    (N'APPROVE_ORDER', N'Approve order', N'ORDER', 1),
    (N'CANCEL_ORDER', N'Cancel order', N'ORDER', 1),

-- Customer Management
    (N'VIEW_CUSTOMER', N'View customer list', N'CUSTOMER', 1),
    (N'CREATE_CUSTOMER', N'Add new customer', N'CUSTOMER', 1),
    (N'UPDATE_CUSTOMER', N'Update customer information', N'CUSTOMER', 1),
    (N'DELETE_CUSTOMER', N'Delete customer', N'CUSTOMER', 1),

-- Inventory Management
    (N'VIEW_INVENTORY', N'View inventory', N'INVENTORY', 1),
    (N'UPDATE_INVENTORY', N'Update inventory', N'INVENTORY', 1),
    (N'CREATE_PURCHASE_ORDER', N'Create purchase order', N'INVENTORY', 1),
    (N'APPROVE_PURCHASE_ORDER', N'Approve purchase order', N'INVENTORY', 1),
    (N'RECEIVE_GOODS', N'Receive goods into warehouse', N'INVENTORY', 1),
    (N'STOCK_ADJUSTMENT', N'Adjust stock', N'INVENTORY', 1),

-- Report Management
    (N'VIEW_SALES_REPORT', N'View sales report', N'REPORT', 1),
    (N'VIEW_INVENTORY_REPORT', N'View inventory report', N'REPORT', 1),
    (N'VIEW_FINANCIAL_REPORT', N'View financial report', N'REPORT', 1),
    (N'VIEW_CUSTOMER_REPORT', N'View customer report', N'REPORT', 1),
    (N'EXPORT_REPORT', N'Export report', N'REPORT', 1),

-- System Management
    (N'VIEW_USER', N'View user list', N'SYSTEM', 1),
    (N'CREATE_USER', N'Create new user', N'SYSTEM', 1),
    (N'UPDATE_USER', N'Update user', N'SYSTEM', 1),
    (N'DELETE_USER', N'Delete user', N'SYSTEM', 1),
    (N'MANAGE_ROLE', N'Manage roles and permissions', N'SYSTEM', 1),
    (N'VIEW_AUDIT_LOG', N'View system audit log', N'SYSTEM', 1),
    (N'SYSTEM_CONFIG', N'Configure system settings', N'SYSTEM', 1),

-- Promotion Management
    (N'VIEW_PROMOTION', N'View promotions', N'PROMOTION', 1),
    (N'CREATE_PROMOTION', N'Create promotion', N'PROMOTION', 1),
    (N'UPDATE_PROMOTION', N'Update promotion', N'PROMOTION', 1),
    (N'DELETE_PROMOTION', N'Delete promotion', N'PROMOTION', 1);


-- Insert default walk-in customer (REQUIRED for POS system)
INSERT INTO customers (customer_id, customer_code, full_name, phone, active)
VALUES ('00000000-0000-0000-0000-000000000001',
        'DEFAULT',
        N'Khách lẻ',
        N'Khách lẻ',
        1);
