INSERT INTO roles (role_name, [description], active)
VALUES (N'Admin', N'System Administrator - Full access rights', 1),
       (N'Shop Owner', N'Shop Owner - Manages all business operations', 1),
       (N'Warehouse Staff', N'Warehouse Staff - Manages inventory receipts and issues', 1),
       (N'Sales Staff', N'Sales Staff - Processes orders and manages customers', 1);

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

DECLARE @adminUsername NVARCHAR(50) = 'admin';
DECLARE @adminEmail    NVARCHAR(100) = 'admin@snapbuy.com';

IF NOT EXISTS (SELECT 1 FROM accounts WHERE username = @adminUsername OR email = @adminEmail)
BEGIN
    DECLARE @adminId UNIQUEIDENTIFIER = NEWID();

INSERT INTO accounts (account_id, full_name, username, password_hash, email, active, created_date, updated_date)
VALUES (
           @adminId,
           N'Admin',
           @adminUsername,
           -- BCrypt for "admin123"
           '$2a$10$.KiG7oyd3/JtvMSfV0tdBefCs2eLKBx2LlO6uwPO82fM6nhlGYeIq',
           @adminEmail,
           1, GETDATE(), GETDATE()
       );

DECLARE @roleAdmin UNIQUEIDENTIFIER =
        (SELECT TOP 1 role_id FROM roles WHERE role_name = N'Admin');

    IF @roleAdmin IS NOT NULL
        INSERT INTO account_roles(account_id, role_id) VALUES (@adminId, @roleAdmin);
END

INSERT INTO customers (customer_code, full_name, phone, gender)
VALUES
    ('CUST001', N'Nguyễn Văn A', '0905123456', N'Male'),
    ('CUST002', N'Trần Thị B', '0905789123', N'Female'),
    ('CUST003', N'Lê Minh C', '0912345678', N'Male'),
    ('CUST004', N'Phạm Ngọc D', '0987456123', N'Female'),
    ('CUST005', N'Hoàng Anh E', '0932123456', N'Male');

INSERT INTO categories (category_name, [description])
VALUES
    (N'Bếp điện & bếp từ', N'Các loại bếp điện, bếp từ Sunhouse'),
    (N'Nồi & chảo', N'Nồi inox, chảo chống dính, chảo sâu lòng Sunhouse'),
    (N'Đồ điện gia dụng', N'Ấm siêu tốc, quạt điện, máy xay Sunhouse'),
    (N'Dụng cụ nhà bếp', N'Dụng cụ nấu ăn, dao thớt, hộp bảo quản'),
    (N'Máy lọc nước', N'Máy lọc nước RO và thiết bị lọc của Sunhouse');

INSERT INTO suppliers (supplier_code, supplier_name, phone, email, [address], city, ward)
VALUES
    ('SUP001', N'Công ty TNHH Sunhouse Việt Nam', '02436612345', 'contact@sunhouse.com.vn', N'Số 5 Tô Vĩnh Diện', N'Hà Nội', N'Thanh Xuân'),
    ('SUP002', N'Công ty TNHH Gia Dụng Minh Tâm', '02838965432', 'minhtam@suppliers.vn', N'12 Nguyễn Văn Linh', N'Hồ Chí Minh', N'Quận 7'),
    ('SUP003', N'Công ty TNHH Phân Phối Hòa Bình', '02256325478', 'hoabinh@distribution.vn', N'45 Lạch Tray', N'Hải Phòng', N'Lê Chân'),
    ('SUP004', N'Công ty TNHH Thiết Bị Việt Phát', '02363789412', 'vietphat@supply.vn', N'23 Nguyễn Hữu Thọ', N'Đà Nẵng', N'Hải Châu'),
    ('SUP005', N'Công ty TNHH Gia Dụng Bắc Nam', '02923784561', 'bactrungnam@supply.vn', N'15 Phan Chu Trinh', N'Cần Thơ', N'Ninh Kiều');

INSERT INTO products (product_name, product_code, [description], category_id, supplier_id, unit, dimensions, image_url)
VALUES
    (N'Bếp từ đôi Sunhouse SHB9101', 'PRD001', N'Bếp từ đôi Sunhouse 2100W, mặt kính chịu nhiệt',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Bếp điện & bếp từ'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Chiếc', N'73x43x6cm', N'https://sunhouse.com.vn/images/products/shb9101.jpg'),

    (N'Nồi inox 3 đáy Sunhouse SH334', 'PRD002', N'Nồi inox 3 đáy dung tích 5L, dùng cho bếp từ',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Nồi & chảo'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'28cm', N'https://sunhouse.com.vn/images/products/sh334.jpg'),

    (N'Chảo chống dính Sunhouse CS26', 'PRD003', N'Chảo chống dính sâu lòng 26cm, lớp phủ Whitford',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Nồi & chảo'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'26cm', N'https://sunhouse.com.vn/images/products/cs26.jpg'),

    (N'Ấm siêu tốc Sunhouse SHD1182', 'PRD004', N'Ấm siêu tốc 1.8L, vỏ inox, công suất 1500W',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Đồ điện gia dụng'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'20x25cm', N'https://sunhouse.com.vn/images/products/shd1182.jpg'),

    (N'Máy lọc nước RO Sunhouse SHR76210CK', 'PRD005', N'Máy lọc nước RO 10 lõi, công suất 10L/h',
     (SELECT TOP 1 category_id FROM categories WHERE category_name = N'Máy lọc nước'),
     (SELECT TOP 1 supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), N'Cái', N'45x35x90cm', N'https://sunhouse.com.vn/images/products/shr76210ck.jpg');

INSERT INTO product_price (product_id, unit_price, cost_price, tax_rate)
VALUES
    ((SELECT product_id FROM products WHERE product_code = 'PRD001'), 4500000, 3800000, 10),
    ((SELECT product_id FROM products WHERE product_code = 'PRD002'), 650000, 500000, 10),
    ((SELECT product_id FROM products WHERE product_code = 'PRD003'), 490000, 350000, 10),
    ((SELECT product_id FROM products WHERE product_code = 'PRD004'), 420000, 300000, 10),
    ((SELECT product_id FROM products WHERE product_code = 'PRD005'), 7800000, 6400000, 10);

INSERT INTO purchase_order (purchase_order_number, supplier_id, account_id, order_date, [status], total_amount, tax_amount, notes)
VALUES
    ('PO001', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), 'APPROVED', 20000000, 2000000, N'Nhập hàng Sunhouse đợt 1'),
    ('PO002', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP002'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), 'RECEIVED', 15000000, 1500000, N'Nhập hàng Minh Tâm'),
    ('PO003', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP003'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), 'PENDING', 10000000, 1000000, N'Đơn hàng đang chờ duyệt'),
    ('PO004', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP001'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), 'APPROVED', 25000000, 2500000, N'Nhập thêm sản phẩm Sunhouse'),
    ('PO005', (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP004'), (SELECT TOP 1 account_id FROM accounts), GETDATE(), 'RECEIVED', 12000000, 1200000, N'Đã nhận đủ hàng Việt Phát');

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
