INSERT INTO roles (role_name, [description], active)
VALUES (N'Quản trị viên', N'System Administrator - Full access rights', 1),
       (N'Chủ cửa hàng', N'Shop Owner - Manages all business operations', 1),
       (N'Nhân viên kho', N'Warehouse Staff - Manages inventory receipts and issues', 1),
       (N'Nhân viên bán hàng', N'Sales Staff - Processes orders and manages customers', 1);

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

--

-- 1️⃣ Insert 4 accounts
INSERT INTO accounts (full_name, username, password_hash, email, phone, avatar_url, active)
VALUES
    (N'Quản trị viên', N'admin',
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

-- 2️⃣ Assign roles to each account
DECLARE @adminId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'admin');
DECLARE @roleAdmin UNIQUEIDENTIFIER = (SELECT role_id FROM roles WHERE role_name = N'Quản trị viên');
INSERT INTO account_roles (account_id, role_id) VALUES (@adminId, @roleAdmin);

DECLARE @shopOwnerId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'shopowner');
DECLARE @roleShopOwner UNIQUEIDENTIFIER = (SELECT role_id FROM roles WHERE role_name = N'Chủ cửa hàng');
INSERT INTO account_roles (account_id, role_id) VALUES (@shopOwnerId, @roleShopOwner);

DECLARE @warehouseId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'warehouse');
DECLARE @roleWarehouse UNIQUEIDENTIFIER = (SELECT role_id FROM roles WHERE role_name = N'Nhân viên kho');
INSERT INTO account_roles (account_id, role_id) VALUES (@warehouseId, @roleWarehouse);

DECLARE @salesId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'sales');
DECLARE @roleSales UNIQUEIDENTIFIER = (SELECT role_id FROM roles WHERE role_name = N'Nhân viên bán hàng');
INSERT INTO account_roles (account_id, role_id) VALUES (@salesId, @roleSales);

INSERT INTO customers (customer_code, full_name, phone, gender)
VALUES
    ('CUST001', N'Nguyễn Văn A', '0905123456', N'Male'),
    ('CUST002', N'Trần Thị B', '0905789123', N'Female'),
    ('CUST003', N'Lê Minh C', '0912345678', N'Male'),
    ('CUST004', N'Phạm Ngọc D', '0987456123', N'Female'),
    ('CUST005', N'Hoàng Anh E', '0932123456', N'Male');

-- Bước 1: Insert các danh mục cha (parent_category_id = NULL)
INSERT INTO categories (category_name, description, parent_category_id, active)
VALUES
    (N'Đồ gia dụng', N'Các sản phẩm gia dụng truyền thống như nồi, chảo, bộ nấu ăn', NULL, 1),
    (N'Điện gia dụng', N'Các thiết bị điện phục vụ sinh hoạt hàng ngày', NULL, 1);

-- Bước 2: Lấy ID của các danh mục cha vừa tạo
DECLARE @DoGiaDungId UNIQUEIDENTIFIER;
DECLARE @DienGiaDungId UNIQUEIDENTIFIER;

SELECT @DoGiaDungId = category_id FROM categories WHERE category_name = N'Đồ gia dụng';
SELECT @DienGiaDungId = category_id FROM categories WHERE category_name = N'Điện gia dụng';

INSERT INTO categories (category_name, description, parent_category_id, active)
VALUES
    (N'Bộ nồi Anod', N'Bộ nồi cao cấp phủ Anodized', @DoGiaDungId, 1),
    (N'Chảo chống dính', N'Các loại chảo chống dính đa dạng kích thước', @DoGiaDungId, 1),
    (N'Nồi áp suất', N'Nồi áp suất tiết kiệm thời gian nấu ăn', @DoGiaDungId, 1),
    (N'Bộ nồi Inox', N'Bộ nồi inox cao cấp bền đẹp', @DoGiaDungId, 1),

    -- Con của Điện gia dụng
    (N'Nồi cơm điện', N'Nồi cơm điện đa năng các dung tích', @DienGiaDungId, 1),
    (N'Máy xay sinh tố', N'Máy xay sinh tố công suất mạnh', @DienGiaDungId, 1),
    (N'Quạt đứng', N'Quạt đứng tiết kiệm điện', @DienGiaDungId, 1),
    (N'Bếp điện từ', N'Bếp điện từ an toàn hiện đại', @DienGiaDungId, 1);


INSERT INTO suppliers (supplier_code, supplier_name, phone, email, [address], city, ward)
VALUES
    ('SUP001', N'Công ty TNHH Sunhouse Việt Nam', '02436612345', 'contact@sunhouse.com.vn', N'Số 5 Tô Vĩnh Diện', N'Hà Nội', N'Thanh Xuân'),
    ('SUP002', N'Công ty TNHH Gia Dụng Minh Tâm', '02838965432', 'minhtam@suppliers.vn', N'12 Nguyễn Văn Linh', N'Hồ Chí Minh', N'Quận 7'),
    ('SUP003', N'Công ty TNHH Phân Phối Hòa Bình', '02256325478', 'hoabinh@distribution.vn', N'45 Lạch Tray', N'Hải Phòng', N'Lê Chân'),
    ('SUP004', N'Công ty TNHH Thiết Bị Việt Phát', '02363789412', 'vietphat@supply.vn', N'23 Nguyễn Hữu Thọ', N'Đà Nẵng', N'Hải Châu'),
    ('SUP005', N'Công ty TNHH Gia Dụng Bắc Nam', '02923784561', 'bactrungnam@supply.vn', N'15 Phan Chu Trinh', N'Cần Thơ', N'Ninh Kiều');

INSERT INTO products (product_name, product_code, [description], category_id, supplier_id, unit, dimensions, image_url)
VALUES
    -- Sản phẩm thuộc danh mục "Bộ nồi Inox"
    (N'Bộ nồi Inox 3 đáy Sunhouse SH333', 'PRD001', N'Bộ nồi inox 3 đáy cao cấp, dùng được cho bếp từ',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Bộ nồi Inox'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Bộ', N'16cm-20cm-24cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Sản phẩm thuộc danh mục "Bộ nồi Anod"
    (N'Bộ nồi Anod Sunhouse AN668', 'PRD002', N'Bộ nồi Anod phủ chống dính, nấu nhanh chín đều',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Bộ nồi Anod'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Bộ', N'18cm-22cm-26cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Sản phẩm thuộc danh mục "Chảo chống dính"
    (N'Chảo chống dính Sunhouse CS26', 'PRD003', N'Chảo chống dính sâu lòng 26cm, lớp phủ Whitford',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Chảo chống dính'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'26cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Sản phẩm thuộc danh mục "Nồi áp suất"
    (N'Nồi áp suất Sunhouse SH735', 'PRD004', N'Nồi áp suất 7L, tiết kiệm thời gian nấu ăn',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Nồi áp suất'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'24cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Sản phẩm thuộc danh mục "Nồi cơm điện"
    (N'Nồi cơm điện Sunhouse SHD8955', 'PRD005', N'Nồi cơm điện 1.8L, công nghệ nấu 3D',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Nồi cơm điện'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'28x28x30cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Sản phẩm thuộc danh mục "Máy xay sinh tố"
    (N'Máy xay sinh tố Sunhouse SHD5115', 'PRD006', N'Máy xay sinh tố 1.5L, công suất 500W',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Máy xay sinh tố'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'35x20x40cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Sản phẩm thuộc danh mục "Bếp điện từ"
    (N'Bếp điện từ đơn Sunhouse SHB9100', 'PRD007', N'Bếp điện từ đơn 2000W, mặt kính chịu nhiệt',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Bếp điện từ'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Chiếc', N'30x37x6cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Sản phẩm thuộc danh mục "Quạt đứng"
    (N'Quạt đứng Sunhouse SHD7728', 'PRD008', N'Quạt đứng 3 cánh, 3 tốc độ gió',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Quạt đứng'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'40x40x120cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Thêm sản phẩm mới - Chảo chống dính thêm
    (N'Chảo chống dính Sunhouse CS28', 'PRD009', N'Chảo chống dính đáy từ 28cm, an toàn sức khỏe',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Chảo chống dính'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'28cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg'),

    -- Thêm sản phẩm mới - Nồi cơm điện thêm
    (N'Nồi cơm điện cao tần Sunhouse SHD8858', 'PRD010', N'Nồi cơm điện cao tần 1.5L, nấu nhanh thơm ngon',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Nồi cơm điện'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'26x26x28cm', N'https://sunhouse.com.vn/pic/product/bo-noi-inox-3-day-sunhouse-sh335-002.jpg');

INSERT INTO product_price (product_id, unit_price, cost_price)
VALUES
    -- PRD001: Bộ nồi Inox 3 đáy Sunhouse SH333
    ((SELECT product_id FROM products WHERE product_code = 'PRD001'), 1850000, 1500000),

    -- PRD002: Bộ nồi Anod Sunhouse AN668
    ((SELECT product_id FROM products WHERE product_code = 'PRD002'), 2200000, 1800000),

    -- PRD003: Chảo chống dính Sunhouse CS26
    ((SELECT product_id FROM products WHERE product_code = 'PRD003'), 490000, 350000),

    -- PRD004: Nồi áp suất Sunhouse SH735
    ((SELECT product_id FROM products WHERE product_code = 'PRD004'), 1650000, 1300000),

    -- PRD005: Nồi cơm điện Sunhouse SHD8955
    ((SELECT product_id FROM products WHERE product_code = 'PRD005'), 2890000, 2300000),

    -- PRD006: Máy xay sinh tố Sunhouse SHD5115
    ((SELECT product_id FROM products WHERE product_code = 'PRD006'), 890000, 650000),

    -- PRD007: Bếp điện từ đơn Sunhouse SHB9100
    ((SELECT product_id FROM products WHERE product_code = 'PRD007'), 1590000, 1200000),

    -- PRD008: Quạt đứng Sunhouse SHD7728
    ((SELECT product_id FROM products WHERE product_code = 'PRD008'), 750000, 550000),

    -- PRD009: Chảo chống dính Sunhouse CS28
    ((SELECT product_id FROM products WHERE product_code = 'PRD009'), 550000, 400000),

    -- PRD010: Nồi cơm điện cao tần Sunhouse SHD8858
    ((SELECT product_id FROM products WHERE product_code = 'PRD010'), 3290000, 2600000);


INSERT INTO purchase_order (purchase_order_number, supplier_id, account_id, order_date, [status], total_amount, tax_amount, notes)
VALUES
    ('PO001', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), N'Đã duyệt', 20000000, 2000000, N'Nhập hàng Sunhouse đợt 1'),
    ('PO002', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP002'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), N'Đã nhận hàng', 15000000, 1500000, N'Nhập hàng Minh Tâm'),
    ('PO003', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP003'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), N'Chờ duyệt', 10000000, 1000000, N'Đơn hàng đang chờ duyệt'),
    ('PO004', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), N'Đã duyệt', 25000000, 2500000, N'Nhập thêm sản phẩm Sunhouse'),
    ('PO005', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP004'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), N'Đã nhận hàng', 12000000, 1200000, N'Đã nhận đủ hàng Việt Phát');

INSERT INTO purchase_order_detail (purchase_order_id, product_id, quantity, unit_price)
VALUES
    ((SELECT purchase_order_id FROM purchase_order WHERE purchase_order_number = 'PO001'),
     (SELECT product_id FROM products WHERE product_code = 'PRD001'), 10, 3800000),

    ((SELECT purchase_order_id FROM purchase_order WHERE purchase_order_number = 'PO001'),
     (SELECT product_id FROM products WHERE product_code = 'PRD002'), 30, 500000),

    ((SELECT purchase_order_id FROM purchase_order WHERE purchase_order_number = 'PO004'),
     (SELECT product_id FROM products WHERE product_code = 'PRD003'), 40, 350000),

    ((SELECT purchase_order_id FROM purchase_order WHERE purchase_order_number = 'PO004'),
     (SELECT product_id FROM products WHERE product_code = 'PRD004'), 25, 300000),

    ((SELECT purchase_order_id FROM purchase_order WHERE purchase_order_number = 'PO005'),
     (SELECT product_id FROM products WHERE product_code = 'PRD005'), 5, 6400000);

INSERT INTO inventory (product_id, quantity_in_stock, minimum_stock, maximum_stock, reorder_point)
VALUES
    ((SELECT product_id FROM products WHERE product_code = 'PRD001'), 50, 10, 200, 20),
    ((SELECT product_id FROM products WHERE product_code = 'PRD002'), 80, 20, 300, 50),
    ((SELECT product_id FROM products WHERE product_code = 'PRD003'), 60, 15, 250, 40),
    ((SELECT product_id FROM products WHERE product_code = 'PRD004'), 40, 10, 200, 25),
    ((SELECT product_id FROM products WHERE product_code = 'PRD005'), 30, 5, 150, 15);

INSERT INTO inventory_transaction (product_id, account_id, transaction_type, quantity, unit_price, reference_type, notes)
VALUES
    ((SELECT product_id FROM products WHERE product_code = 'PRD001'), (SELECT TOP 1 account_id FROM accounts), N'IMPORT', 10, 3800000, N'PURCHASE_ORDER', N'Nhập hàng từ PO001'),
    ((SELECT product_id FROM products WHERE product_code = 'PRD002'), (SELECT TOP 1 account_id FROM accounts), N'SALE', 5, 650000, N'ORDER', N'Bán cho khách hàng CUST001'),
    ((SELECT product_id FROM products WHERE product_code = 'PRD003'), (SELECT TOP 1 account_id FROM accounts), N'RETURN', 2, 490000, N'ORDER', N'Khách trả hàng'),
    ((SELECT product_id FROM products WHERE product_code = 'PRD004'), (SELECT TOP 1 account_id FROM accounts), N'IMPORT', 3, 420000, N'PURCHASE_ORDER', N'Nhập hàng từ PO001'),
    ((SELECT product_id FROM products WHERE product_code = 'PRD005'), (SELECT TOP 1 account_id FROM accounts), N'IMPORT', 5, 6400000, N'PURCHASE_ORDER', N'Nhập bổ sung hàng RO');

INSERT INTO orders (order_number, customer_id, account_id, order_status, payment_status, total_amount, discount_amount, tax_amount, notes)
VALUES
    ('ORD001', (SELECT customer_id FROM customers WHERE customer_code = 'CUST001'), (SELECT TOP 1 account_id FROM accounts), N'CONFIRMED', N'PAID', 2500000, 0, 250000, N'Đã thanh toán'),
    ('ORD002', (SELECT customer_id FROM customers WHERE customer_code = 'CUST002'), (SELECT TOP 1 account_id FROM accounts), N'PENDING', N'UNPAID', 1500000, 100000, 150000, N'Chờ thanh toán'),
    ('ORD003', (SELECT customer_id FROM customers WHERE customer_code = 'CUST003'), (SELECT TOP 1 account_id FROM accounts), N'COMPLETED', N'PAID', 5600000, 200000, 560000, N'Đã thanh toán'),
    ('ORD004', (SELECT customer_id FROM customers WHERE customer_code = 'CUST004'), (SELECT TOP 1 account_id FROM accounts), N'CANCELLED', N'REFUNDED', 300000, 0, 0, N'Đơn hàng bị hủy'),
    ('ORD005', (SELECT customer_id FROM customers WHERE customer_code = 'CUST005'), (SELECT TOP 1 account_id FROM accounts), N'CONFIRMED', N'PAID', 4500000, 0, 450000, N'Đã thanh toán');

INSERT INTO order_detail (order_id, product_id, quantity, unit_price, discount)
VALUES
    ((SELECT order_id FROM orders WHERE order_number = 'ORD001'), (SELECT product_id FROM products WHERE product_code = 'PRD002'), 2, 650000, 0),
    ((SELECT order_id FROM orders WHERE order_number = 'ORD001'), (SELECT product_id FROM products WHERE product_code = 'PRD004'), 1, 420000, 5),
    ((SELECT order_id FROM orders WHERE order_number = 'ORD002'), (SELECT product_id FROM products WHERE product_code = 'PRD001'), 1, 4500000, 0),
    ((SELECT order_id FROM orders WHERE order_number = 'ORD003'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 4, 490000, 10),
    ((SELECT order_id FROM orders WHERE order_number = 'ORD005'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 1, 7800000, 0);

INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_reference, notes)
VALUES
    ((SELECT order_id FROM orders WHERE order_number = 'ORD001'), N'CASH', 2750000, N'SUCCESS', N'TXN001', N'Thanh toán tiền mặt'),
    ((SELECT order_id FROM orders WHERE order_number = 'ORD002'), N'BANK_TRANSFER', 1500000, N'PENDING', N'TXN002', N'Chờ thanh toán chuyển khoản'),
    ((SELECT order_id FROM orders WHERE order_number = 'ORD003'), N'BANK_TRANSFER', 5600000, N'SUCCESS', N'TXN003', N'Thanh toán chuyển khoản'),
    ((SELECT order_id FROM orders WHERE order_number = 'ORD004'), N'CASH', 300000, N'CANCELLED', N'TXN004', N'Hủy đơn hàng'),
    ((SELECT order_id FROM orders WHERE order_number = 'ORD005'), N'BANK_TRANSFER', 2000000, N'SUCCESS', N'TXN005', N'Thanh toán chuyển khoản');

INSERT INTO promotions (promotion_name, [description], discount_type, discount_value, [start_date], [end_date])
VALUES
    (N'Giảm 10% Toàn Bộ Sản Phẩm', N'Áp dụng cho toàn bộ sản phẩm trong tháng 10', N'PERCENT', 10, '2025-10-01', '2025-10-31'),
    (N'Mua 2 Tặng 1', N'Áp dụng cho nồi & chảo', N'FIXED', 650000, '2025-09-01', '2025-10-15'),
    (N'Giảm 5% Cho Đơn Hàng Trên 5 Triệu', N'Tự động áp dụng khi thanh toán', N'PERCENT', 5, '2025-10-05', '2025-12-31'),
    (N'Ưu Đãi 1 Triệu Cho Máy Lọc Nước', N'Giảm giá đặc biệt cho model SHR76210CK', N'FIXED', 1000000, '2025-10-01', '2025-10-31'),
    (N'Khuyến Mãi Mở Bán Bếp Từ Mới', N'Giảm trực tiếp 500K khi mua bếp từ Sunhouse', N'FIXED', 500000, '2025-09-15', '2025-11-01');

INSERT INTO promotion_product (promotion_id, product_id)
VALUES
    ((SELECT TOP 1 promotion_id FROM promotions WHERE promotion_name = N'Giảm 10% Toàn Bộ Sản Phẩm'),
     (SELECT product_id FROM products WHERE product_code = 'PRD001')),

    ((SELECT TOP 1 promotion_id FROM promotions WHERE promotion_name = N'Giảm 10% Toàn Bộ Sản Phẩm'),
     (SELECT product_id FROM products WHERE product_code = 'PRD002')),

    ((SELECT TOP 1 promotion_id FROM promotions WHERE promotion_name = N'Mua 2 Tặng 1'),
     (SELECT product_id FROM products WHERE product_code = 'PRD003')),

    ((SELECT TOP 1 promotion_id FROM promotions WHERE promotion_name = N'Ưu Đãi 1 Triệu Cho Máy Lọc Nước'),
     (SELECT product_id FROM products WHERE product_code = 'PRD005')),

    ((SELECT TOP 1 promotion_id FROM promotions WHERE promotion_name = N'Khuyến Mãi Mở Bán Bếp Từ Mới'),
     (SELECT product_id FROM products WHERE product_code = 'PRD001'));
