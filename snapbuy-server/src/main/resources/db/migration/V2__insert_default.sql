INSERT INTO roles (role_name, [description], active)
VALUES (N'Quản trị viên', N'Quản trị viên hệ thống - Quyền truy cập đầy đủ', 1),
       (N'Chủ cửa hàng', N'Chủ cửa hàng - Quản lý mọi hoạt động kinh doanh', 1),
       (N'Nhân viên kho', N'Nhân viên kho - Quản lý biên lai và các vấn đề liên quan đến hàng tồn kho', 1),
       (N'Nhân viên bán hàng', N'Nhân viên bán hàng - Xử lý đơn hàng và quản lý khách hàng', 1);


INSERT INTO [permissions] ([permission_name], [description], module, active)
VALUES
-- Product Management
    (N'VIEW_PRODUCT', N'View product list', N'PRODUCT', 1), (N'CREATE_PRODUCT', N'Add new product', N'PRODUCT', 1), (N'UPDATE_PRODUCT', N'Update product information', N'PRODUCT', 1), (N'DELETE_PRODUCT', N'Delete product', N'PRODUCT', 1), (N'IMPORT_PRODUCT', N'Import product list', N'PRODUCT', 1), (N'EXPORT_PRODUCT', N'Export product list', N'PRODUCT', 1),

-- Order Management
    (N'VIEW_ORDER', N'View order list', N'ORDER', 1), (N'CREATE_ORDER', N'Create new order', N'ORDER', 1), (N'UPDATE_ORDER', N'Update order', N'ORDER', 1), (N'DELETE_ORDER', N'Delete order', N'ORDER', 1), (N'APPROVE_ORDER', N'Approve order', N'ORDER', 1), (N'CANCEL_ORDER', N'Cancel order', N'ORDER', 1),

-- Customer Management
    (N'VIEW_CUSTOMER', N'View customer list', N'CUSTOMER', 1), (N'CREATE_CUSTOMER', N'Add new customer', N'CUSTOMER', 1), (N'UPDATE_CUSTOMER', N'Update customer information', N'CUSTOMER', 1), (N'DELETE_CUSTOMER', N'Delete customer', N'CUSTOMER', 1),

-- Inventory Management
    (N'VIEW_INVENTORY', N'View inventory', N'INVENTORY', 1), (N'UPDATE_INVENTORY', N'Update inventory', N'INVENTORY', 1), (N'CREATE_PURCHASE_ORDER', N'Create purchase order', N'INVENTORY', 1), (N'APPROVE_PURCHASE_ORDER', N'Approve purchase order', N'INVENTORY', 1), (N'RECEIVE_GOODS', N'Receive goods into warehouse', N'INVENTORY', 1), (N'STOCK_ADJUSTMENT', N'Adjust stock', N'INVENTORY', 1),

-- Report Management
    (N'VIEW_SALES_REPORT', N'View sales report', N'REPORT', 1), (N'VIEW_INVENTORY_REPORT', N'View inventory report', N'REPORT', 1), (N'VIEW_FINANCIAL_REPORT', N'View financial report', N'REPORT', 1), (N'VIEW_CUSTOMER_REPORT', N'View customer report', N'REPORT', 1), (N'EXPORT_REPORT', N'Export report', N'REPORT', 1),

-- System Management
    (N'VIEW_USER', N'View user list', N'SYSTEM', 1), (N'CREATE_USER', N'Create new user', N'SYSTEM', 1), (N'UPDATE_USER', N'Update user', N'SYSTEM', 1), (N'DELETE_USER', N'Delete user', N'SYSTEM', 1), (N'MANAGE_ROLE', N'Manage roles and permissions', N'SYSTEM', 1), (N'VIEW_AUDIT_LOG', N'View system audit log', N'SYSTEM', 1), (N'SYSTEM_CONFIG', N'Configure system settings', N'SYSTEM', 1),

-- Promotion Management
    (N'VIEW_PROMOTION', N'View promotions', N'PROMOTION', 1), (N'CREATE_PROMOTION', N'Create promotion', N'PROMOTION', 1), (N'UPDATE_PROMOTION', N'Update promotion', N'PROMOTION', 1), (N'DELETE_PROMOTION', N'Delete promotion', N'PROMOTION', 1);


INSERT INTO accounts (full_name, username, password_hash, email, phone, avatar_url, active)
VALUES (N'Quản trị viên', N'admin',
        N'$2a$10$.KiG7oyd3/JtvMSfV0tdBefCs2eLKBx2LlO6uwPO82fM6nhlGYeIq',
        N'admin@snapbuy.com', N'0901000001', NULL, 1),

       (N'Chủ cửa hàng', N'shopowner',
        N'$2a$10$.KiG7oyd3/JtvMSfV0tdBefCs2eLKBx2LlO6uwPO82fM6nhlGYeIq',
        N'shopowner@snapbuy.com', N'0901000002', NULL, 1),

       (N'Nhân viên kho', N'warehouse',
        N'$2a$10$.KiG7oyd3/JtvMSfV0tdBefCs2eLKBx2LlO6uwPO82fM6nhlGYeIq',
        N'warehouse@snapbuy.com', N'0901000003', NULL, 1),

       (N'Nhân viên bán hàng', N'sales',
        N'$2a$10$.KiG7oyd3/JtvMSfV0tdBefCs2eLKBx2LlO6uwPO82fM6nhlGYeIq',
        N'sales@snapbuy.com', N'0901000004', NULL, 1);


DECLARE
@adminId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'admin');
DECLARE
@roleAdmin UNIQUEIDENTIFIER = (SELECT role_id FROM roles WHERE role_name = N'Quản trị viên');
INSERT INTO account_roles (account_id, role_id)
VALUES (@adminId, @roleAdmin);

DECLARE
@shopOwnerId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'shopowner');
DECLARE
@roleShopOwner UNIQUEIDENTIFIER = (SELECT role_id FROM roles WHERE role_name = N'Chủ cửa hàng');
INSERT INTO account_roles (account_id, role_id)
VALUES (@shopOwnerId, @roleShopOwner);

DECLARE
@warehouseId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'warehouse');
DECLARE
@roleWarehouse UNIQUEIDENTIFIER = (SELECT role_id FROM roles WHERE role_name = N'Nhân viên kho');
INSERT INTO account_roles (account_id, role_id)
VALUES (@warehouseId, @roleWarehouse);

DECLARE
@salesId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'sales');
DECLARE
@roleSales UNIQUEIDENTIFIER = (SELECT role_id FROM roles WHERE role_name = N'Nhân viên bán hàng');
INSERT INTO account_roles (account_id, role_id)
VALUES (@salesId, @roleSales);

INSERT INTO customers (customer_id, customer_code, full_name, phone)
VALUES ('00000000-0000-0000-0000-000000000001',
        'DEFAULT',
        N'Khách lẻ',
        N'Khách lẻ');


INSERT INTO categories (category_name, description, parent_category_id, active)
VALUES (N'Đồ gia dụng', N'Các sản phẩm gia dụng truyền thống như nồi, chảo, bộ nấu ăn', NULL, 1),
       (N'Điện gia dụng', N'Các thiết bị điện phục vụ sinh hoạt hàng ngày', NULL, 1);

DECLARE
@DoGiaDungId UNIQUEIDENTIFIER;
DECLARE
@DienGiaDungId UNIQUEIDENTIFIER;

SELECT @DoGiaDungId = category_id
FROM categories
WHERE category_name = N'Đồ gia dụng';
SELECT @DienGiaDungId = category_id
FROM categories
WHERE category_name = N'Điện gia dụng';


INSERT INTO categories (category_name, description, parent_category_id, active)
VALUES (N'Bộ nồi Anod', N'Bộ nồi cao cấp phủ Anodized', @DoGiaDungId, 1),
       (N'Chảo chống dính', N'Các loại chảo chống dính đa dạng kích thước', @DoGiaDungId, 1),
       (N'Nồi áp suất', N'Nồi áp suất tiết kiệm thời gian nấu ăn', @DoGiaDungId, 1),
       (N'Bộ nồi Inox', N'Bộ nồi inox cao cấp bền đẹp', @DoGiaDungId, 1),

       -- Con của Điện gia dụng
       (N'Nồi cơm điện', N'Nồi cơm điện đa năng các dung tích', @DienGiaDungId, 1),
       (N'Máy xay sinh tố', N'Máy xay sinh tố công suất mạnh', @DienGiaDungId, 1),
       (N'Quạt đứng', N'Quạt đứng tiết kiệm điện', @DienGiaDungId, 1),
       (N'Bếp điện từ', N'Bếp điện từ an toàn hiện đại', @DienGiaDungId, 1);


INSERT INTO suppliers (supplier_code, supplier_name, phone, email, [address], city, ward)
VALUES ('SUP001', N'Công ty TNHH Sunhouse Việt Nam', '02436612345', 'contact@sunhouse.com.vn', N'Số 5 Tô Vĩnh Diện',
        N'Hà Nội', N'Thanh Xuân'),
       ('SUP002', N'Công ty TNHH Gia Dụng Minh Tâm', '02838965432', 'minhtam@suppliers.vn', N'12 Nguyễn Văn Linh',
        N'Hồ Chí Minh', N'Quận 7'),
       ('SUP003', N'Công ty TNHH Phân Phối Hòa Bình', '02256325478', 'hoabinh@distribution.vn', N'45 Lạch Tray',
        N'Hải Phòng', N'Lê Chân'),
       ('SUP004', N'Công ty TNHH Thiết Bị Việt Phát', '02363789412', 'vietphat@supply.vn', N'23 Nguyễn Hữu Thọ',
        N'Đà Nẵng', N'Hải Châu'),
       ('SUP005', N'Công ty TNHH Gia Dụng Bắc Nam', '02923784561', 'bactrungnam@supply.vn', N'15 Phan Chu Trinh',
        N'Cần Thơ', N'Ninh Kiều');


INSERT INTO products (product_name, product_code, [description], category_id, supplier_id, unit, dimensions, image_url)
VALUES (N'Bộ nồi Inox 3 đáy Sunhouse SH333', 'PRD001', N'Bộ nồi inox 3 đáy cao cấp, dùng được cho bếp từ',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Bộ nồi Inox'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Bộ', N'16cm-20cm-24cm', NULL),

       (N'Bộ nồi Anod Sunhouse AN668', 'PRD002', N'Bộ nồi Anod phủ chống dính, nấu nhanh chín đều',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Bộ nồi Anod'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Bộ', N'18cm-22cm-26cm', NULL),

       (N'Chảo chống dính Sunhouse CS26', 'PRD003', N'Chảo chống dính sâu lòng 26cm, lớp phủ Whitford',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Chảo chống dính'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'26cm', NULL),

       (N'Nồi áp suất Sunhouse SH735', 'PRD004', N'Nồi áp suất 7L, tiết kiệm thời gian nấu ăn',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Nồi áp suất'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'24cm', NULL),

       (N'Nồi cơm điện Sunhouse SHD8955', 'PRD005', N'Nồi cơm điện 1.8L, công nghệ nấu 3D',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Nồi cơm điện'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'28x28x30cm', NULL),

       (N'Máy xay sinh tố Sunhouse SHD5115', 'PRD006', N'Máy xay sinh tố 1.5L, công suất 500W',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Máy xay sinh tố'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'35x20x40cm', NULL),

       (N'Bếp điện từ đơn Sunhouse SHB9100', 'PRD007', N'Bếp điện từ đơn 2000W, mặt kính chịu nhiệt',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Bếp điện từ'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Chiếc', N'30x37x6cm', NULL),

       (N'Quạt đứng Sunhouse SHD7728', 'PRD008', N'Quạt đứng 3 cánh, 3 tốc độ gió',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Quạt đứng'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'40x40x120cm', NULL),

       (N'Chảo chống dính Sunhouse CS28', 'PRD009', N'Chảo chống dính đáy từ 28cm, an toàn sức khỏe',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Chảo chống dính'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'28cm', NULL),

       (N'Nồi cơm điện cao tần Sunhouse SHD8858', 'PRD010', N'Nồi cơm điện cao tần 1.5L, nấu nhanh thơm ngon',
        (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Nồi cơm điện'),
        (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'26x26x28cm', NULL);


INSERT INTO product_price (product_id, unit_price, cost_price)
VALUES ((SELECT product_id FROM products WHERE product_code = 'PRD001'), 1850000, 1500000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD002'), 2200000, 1800000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD003'), 490000, 350000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD004'), 1650000, 1300000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD005'), 2890000, 2300000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD006'), 890000, 650000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD007'), 1590000, 1200000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD008'), 750000, 550000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD009'), 550000, 400000),
       ((SELECT product_id FROM products WHERE product_code = 'PRD010'), 3290000, 2600000);


INSERT INTO inventory (product_id, quantity_in_stock, minimum_stock, maximum_stock, reorder_point)
VALUES ((SELECT product_id FROM products WHERE product_code = 'PRD001'), 50, 10, 200, 20),
       ((SELECT product_id FROM products WHERE product_code = 'PRD002'), 80, 20, 300, 50),
       ((SELECT product_id FROM products WHERE product_code = 'PRD003'), 60, 15, 250, 40),
       ((SELECT product_id FROM products WHERE product_code = 'PRD004'), 40, 10, 200, 25),
       ((SELECT product_id FROM products WHERE product_code = 'PRD005'), 30, 5, 150, 15),
       ((SELECT product_id FROM products WHERE product_code = 'PRD006'), 30, 5, 150, 15),
       ((SELECT product_id FROM products WHERE product_code = 'PRD007'), 30, 5, 150, 15),
       ((SELECT product_id FROM products WHERE product_code = 'PRD008'), 30, 5, 150, 15),
       ((SELECT product_id FROM products WHERE product_code = 'PRD009'), 30, 5, 150, 15),
       ((SELECT product_id FROM products WHERE product_code = 'PRD010'), 30, 5, 150, 15);

