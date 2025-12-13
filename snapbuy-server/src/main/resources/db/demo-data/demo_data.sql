-- Demo Data for Testing Tenant Database
-- This script inserts sample data for testing purposes
-- Run this script after tenant creation to populate with sample data
-- NOTE: Owner account already created during tenant registration, only insert staff accounts

-- Demo Staff Accounts (warehouse and sales only, NO owner/shopowner)
INSERT INTO accounts (full_name, username, password_hash, email, phone, avatar_url, active)
VALUES (N'Nhân viên kho Demo', N'warehouse',
        N'$2a$10$.KiG7oyd3/JtvMSfV0tdBefCs2eLKBx2LlO6uwPO82fM6nhlGYeIq',
        N'warehouse@demo.com', N'0901000003', NULL, 1),

       (N'Nhân viên bán hàng Demo', N'sales',
        N'$2a$10$.KiG7oyd3/JtvMSfV0tdBefCs2eLKBx2LlO6uwPO82fM6nhlGYeIq',
        N'sales@demo.com', N'0901000004', NULL, 1);


-- Assign roles to demo staff accounts
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


-- Demo Categories
INSERT INTO categories (category_name, description, parent_category_id, active)
VALUES (N'Đồ gia dụng', N'Các sản phẩm gia dụng truyền thống như nồi, chảo, bộ nấu ăn', NULL, 1),
       (N'Điện gia dụng', N'Các thiết bị điện phục vụ sinh hoạt hàng ngày', NULL, 1);

DECLARE @DoGiaDungId UNIQUEIDENTIFIER;
DECLARE @DienGiaDungId UNIQUEIDENTIFIER;

SELECT @DoGiaDungId = category_id FROM categories WHERE category_name = N'Đồ gia dụng';
SELECT @DienGiaDungId = category_id FROM categories WHERE category_name = N'Điện gia dụng';

INSERT INTO categories (category_name, description, parent_category_id, active)
VALUES (N'Bộ nồi Anod', N'Bộ nồi cao cấp phủ Anodized', @DoGiaDungId, 1),
       (N'Chảo chống dính', N'Các loại chảo chống dính đa dạng kích thước', @DoGiaDungId, 1),
       (N'Nồi áp suất', N'Nồi áp suất tiết kiệm thời gian nấu ăn', @DoGiaDungId, 1),
       (N'Bộ nồi Inox', N'Bộ nồi inox cao cấp bền đẹp', @DoGiaDungId, 1),
       (N'Nồi cơm điện', N'Nồi cơm điện đa năng các dung tích', @DienGiaDungId, 1),
       (N'Máy xay sinh tố', N'Máy xay sinh tố công suất mạnh', @DienGiaDungId, 1),
       (N'Quạt đứng', N'Quạt đứng tiết kiệm điện', @DienGiaDungId, 1),
       (N'Bếp điện từ', N'Bếp điện từ an toàn hiện đại', @DienGiaDungId, 1);


-- Demo Suppliers
INSERT INTO suppliers (supplier_code, supplier_name, phone, email, [address], city, ward)
VALUES ('SUP001', N'Công ty TNHH Sunhouse Việt Nam', '02436612345', 'contact@sunhouse.com.vn', N'Số 5 Tô Vĩnh Diện', N'Hà Nội', N'Thanh Xuân'),
       ('SUP002', N'Công ty TNHH Gia Dụng Minh Tâm', '02838965432', 'minhtam@suppliers.vn', N'12 Nguyễn Văn Linh', N'Hồ Chí Minh', N'Quận 7'),
       ('SUP003', N'Công ty TNHH Phân Phối Hòa Bình', '02256325478', 'hoabinh@distribution.vn', N'45 Lạch Tray', N'Hải Phòng', N'Lê Chân'),
       ('SUP004', N'Công ty TNHH Thiết Bị Việt Phát', '02363789412', 'vietphat@supply.vn', N'23 Nguyễn Hữu Thọ', N'Đà Nẵng', N'Hải Châu'),
       ('SUP005', N'Công ty TNHH Gia Dụng Bắc Nam', '02923784561', 'bactrungnam@supply.vn', N'15 Phan Chu Trinh', N'Cần Thơ', N'Ninh Kiều');


-- Demo Products (10 products)
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


-- Demo Product Prices
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


-- Demo Inventory
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


-- Sample Orders (24 orders - 2 per month from Dec 2024 to Nov 2025)
DECLARE @salesAccountId UNIQUEIDENTIFIER = (SELECT account_id FROM accounts WHERE username = N'sales');
DECLARE @defaultCustomerId UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000001';

-- Tháng 12/2024
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD241203001', @defaultCustomerId, @salesAccountId, '2024-12-03 10:30:00', N'Hoàn tất', N'Đã thanh toán', 3740000, 0, 0, '2024-12-03 10:30:00', '2024-12-03 10:30:00'),
       ('ORD241215002', @defaultCustomerId, @salesAccountId, '2024-12-15 14:20:00', N'Hoàn tất', N'Đã thanh toán', 5580000, 0, 0, '2024-12-15 14:20:00', '2024-12-15 14:20:00');

-- Tháng 1/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202501001', @defaultCustomerId, @salesAccountId, '2025-01-14 11:20:00', N'Hoàn tất', N'Đã thanh toán', 5270000, 0, 0, '2025-01-14 11:20:00', '2025-01-14 11:20:00'),
       ('ORD202501002', @defaultCustomerId, @salesAccountId, '2025-01-29 15:35:00', N'Hoàn tất', N'Đã thanh toán', 3890000, 0, 0, '2025-01-29 15:35:00', '2025-01-29 15:35:00');

-- Tháng 2/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202502001', @defaultCustomerId, @salesAccountId, '2025-02-08 09:40:00', N'Hoàn tất', N'Đã thanh toán', 4560000, 0, 0, '2025-02-08 09:40:00', '2025-02-08 09:40:00'),
       ('ORD202502002', @defaultCustomerId, @salesAccountId, '2025-02-23 13:25:00', N'Hoàn tất', N'Đã thanh toán', 6820000, 0, 0, '2025-02-23 13:25:00', '2025-02-23 13:25:00');

-- Tháng 3/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202503001', @defaultCustomerId, @salesAccountId, '2025-03-11 10:00:00', N'Hoàn tất', N'Đã thanh toán', 7180000, 0, 0, '2025-03-11 10:00:00', '2025-03-11 10:00:00'),
       ('ORD202503002', @defaultCustomerId, @salesAccountId, '2025-03-27 16:15:00', N'Hoàn tất', N'Đã thanh toán', 5430000, 0, 0, '2025-03-27 16:15:00', '2025-03-27 16:15:00');

-- Tháng 4/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202504001', @defaultCustomerId, @salesAccountId, '2025-04-06 11:10:00', N'Hoàn tất', N'Đã thanh toán', 6290000, 0, 0, '2025-04-06 11:10:00', '2025-04-06 11:10:00'),
       ('ORD202504002', @defaultCustomerId, @salesAccountId, '2025-04-21 14:40:00', N'Hoàn tất', N'Đã thanh toán', 4120000, 0, 0, '2025-04-21 14:40:00', '2025-04-21 14:40:00');

-- Tháng 5/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202505001', @defaultCustomerId, @salesAccountId, '2025-05-09 09:30:00', N'Hoàn tất', N'Đã thanh toán', 5840000, 0, 0, '2025-05-09 09:30:00', '2025-05-09 09:30:00'),
       ('ORD202505002', @defaultCustomerId, @salesAccountId, '2025-05-24 15:20:00', N'Hoàn tất', N'Đã thanh toán', 3350000, 0, 0, '2025-05-24 15:20:00', '2025-05-24 15:20:00');

-- Tháng 6/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202506001', @defaultCustomerId, @salesAccountId, '2025-06-03 10:15:00', N'Hoàn tất', N'Đã thanh toán', 7450000, 0, 0, '2025-06-03 10:15:00', '2025-06-03 10:15:00'),
       ('ORD202506002', @defaultCustomerId, @salesAccountId, '2025-06-19 13:50:00', N'Hoàn tất', N'Đã thanh toán', 4980000, 0, 0, '2025-06-19 13:50:00', '2025-06-19 13:50:00');

-- Tháng 7/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202507001', @defaultCustomerId, @salesAccountId, '2025-07-12 11:30:00', N'Hoàn tất', N'Đã thanh toán', 5290000, 0, 0, '2025-07-12 11:30:00', '2025-07-12 11:30:00'),
       ('ORD202507002', @defaultCustomerId, @salesAccountId, '2025-07-28 16:00:00', N'Hoàn tất', N'Đã thanh toán', 3680000, 0, 0, '2025-07-28 16:00:00', '2025-07-28 16:00:00');

-- Tháng 8/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202508001', @defaultCustomerId, @salesAccountId, '2025-08-07 09:45:00', N'Hoàn tất', N'Đã thanh toán', 6840000, 0, 0, '2025-08-07 09:45:00', '2025-08-07 09:45:00'),
       ('ORD202508002', @defaultCustomerId, @salesAccountId, '2025-08-18 14:25:00', N'Hoàn tất', N'Đã thanh toán', 4050000, 0, 0, '2025-08-18 14:25:00', '2025-08-18 14:25:00');

-- Tháng 9/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202509001', @defaultCustomerId, @salesAccountId, '2025-09-10 10:20:00', N'Hoàn tất', N'Đã thanh toán', 5780000, 0, 0, '2025-09-10 10:20:00', '2025-09-10 10:20:00'),
       ('ORD202509002', @defaultCustomerId, @salesAccountId, '2025-09-25 15:10:00', N'Hoàn tất', N'Đã thanh toán', 3140000, 0, 0, '2025-09-25 15:10:00', '2025-09-25 15:10:00');

-- Tháng 10/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202510001', @defaultCustomerId, @salesAccountId, '2025-10-08 11:00:00', N'Hoàn tất', N'Đã thanh toán', 3290000, 0, 0, '2025-10-08 11:00:00', '2025-10-08 11:00:00'),
       ('ORD202510002', @defaultCustomerId, @salesAccountId, '2025-10-22 13:30:00', N'Hoàn tất', N'Đã thanh toán', 4540000, 0, 0, '2025-10-22 13:30:00', '2025-10-22 13:30:00');

-- Tháng 11/2025
INSERT INTO orders (order_number, customer_id, account_id, order_date, order_status, payment_status, total_amount, discount_amount, tax_amount, created_date, updated_date)
VALUES ('ORD202511001', @defaultCustomerId, @salesAccountId, '2025-11-05 09:15:00', N'Hoàn tất', N'Đã thanh toán', 4690000, 0, 0, '2025-11-05 09:15:00', '2025-11-05 09:15:00'),
       ('ORD202511002', @defaultCustomerId, @salesAccountId, '2025-11-20 16:45:00', N'Hoàn tất', N'Đã thanh toán', 6180000, 0, 0, '2025-11-20 16:45:00', '2025-11-20 16:45:00');


-- Order Details for 24 orders
INSERT INTO order_detail (order_id, product_id, quantity, unit_price, discount)
VALUES 
-- Order 1 - Dec 2024
((SELECT order_id FROM orders WHERE order_number = 'ORD241203001'), (SELECT product_id FROM products WHERE product_code = 'PRD001'), 2, 1850000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD241203001'), (SELECT product_id FROM products WHERE product_code = 'PRD009'), 1, 550000, 10),

-- Order 2 - Dec 2024
((SELECT order_id FROM orders WHERE order_number = 'ORD241215002'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 1, 2890000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD241215002'), (SELECT product_id FROM products WHERE product_code = 'PRD007'), 1, 1590000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD241215002'), (SELECT product_id FROM products WHERE product_code = 'PRD006'), 1, 890000, 0),

-- Order 3 - Jan 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202501001'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 1, 2890000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202501001'), (SELECT product_id FROM products WHERE product_code = 'PRD002'), 1, 2200000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202501001'), (SELECT product_id FROM products WHERE product_code = 'PRD009'), 1, 550000, 30),

-- Order 4 - Jan 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202501002'), (SELECT product_id FROM products WHERE product_code = 'PRD004'), 2, 1650000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202501002'), (SELECT product_id FROM products WHERE product_code = 'PRD008'), 1, 750000, 10),

-- Order 5 - Feb 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202502001'), (SELECT product_id FROM products WHERE product_code = 'PRD001'), 2, 1850000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202502001'), (SELECT product_id FROM products WHERE product_code = 'PRD006'), 1, 890000, 0),

-- Order 6 - Feb 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202502002'), (SELECT product_id FROM products WHERE product_code = 'PRD010'), 2, 3290000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202502002'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 1, 490000, 20),

-- Order 7 - Mar 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202503001'), (SELECT product_id FROM products WHERE product_code = 'PRD010'), 2, 3290000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202503001'), (SELECT product_id FROM products WHERE product_code = 'PRD008'), 1, 750000, 10),

-- Order 8 - Mar 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202503002'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 1, 2890000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202503002'), (SELECT product_id FROM products WHERE product_code = 'PRD007'), 1, 1590000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202503002'), (SELECT product_id FROM products WHERE product_code = 'PRD006'), 1, 890000, 0),

-- Order 9 - Apr 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202504001'), (SELECT product_id FROM products WHERE product_code = 'PRD010'), 1, 3290000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202504001'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 1, 2890000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202504001'), (SELECT product_id FROM products WHERE product_code = 'PRD008'), 1, 750000, 25),

-- Order 10 - Apr 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202504002'), (SELECT product_id FROM products WHERE product_code = 'PRD002'), 1, 2200000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202504002'), (SELECT product_id FROM products WHERE product_code = 'PRD004'), 1, 1650000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202504002'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 1, 490000, 15),

-- Order 11 - May 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202505001'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 2, 2890000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202505001'), (SELECT product_id FROM products WHERE product_code = 'PRD009'), 1, 550000, 20),

-- Order 12 - May 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202505002'), (SELECT product_id FROM products WHERE product_code = 'PRD001'), 1, 1850000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202505002'), (SELECT product_id FROM products WHERE product_code = 'PRD007'), 1, 1590000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202505002'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 1, 490000, 30),

-- Order 13 - Jun 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202506001'), (SELECT product_id FROM products WHERE product_code = 'PRD010'), 2, 3290000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202506001'), (SELECT product_id FROM products WHERE product_code = 'PRD006'), 1, 890000, 0),

-- Order 14 - Jun 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202506002'), (SELECT product_id FROM products WHERE product_code = 'PRD004'), 3, 1650000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202506002'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 1, 490000, 10),

-- Order 15 - Jul 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202507001'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 1, 2890000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202507001'), (SELECT product_id FROM products WHERE product_code = 'PRD002'), 1, 2200000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202507001'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 1, 490000, 30),

-- Order 16 - Jul 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202507002'), (SELECT product_id FROM products WHERE product_code = 'PRD001'), 2, 1850000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202507002'), (SELECT product_id FROM products WHERE product_code = 'PRD008'), 1, 750000, 15),

-- Order 17 - Aug 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202508001'), (SELECT product_id FROM products WHERE product_code = 'PRD010'), 2, 3290000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202508001'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 1, 490000, 10),

-- Order 18 - Aug 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202508002'), (SELECT product_id FROM products WHERE product_code = 'PRD002'), 1, 2200000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202508002'), (SELECT product_id FROM products WHERE product_code = 'PRD001'), 1, 1850000, 0),

-- Order 19 - Sep 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202509001'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 2, 2890000, 0),

-- Order 20 - Sep 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202509002'), (SELECT product_id FROM products WHERE product_code = 'PRD007'), 2, 1590000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202509002'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 1, 490000, 30),

-- Order 21 - Oct 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202510001'), (SELECT product_id FROM products WHERE product_code = 'PRD010'), 1, 3290000, 0),

-- Order 22 - Oct 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202510002'), (SELECT product_id FROM products WHERE product_code = 'PRD004'), 2, 1650000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202510002'), (SELECT product_id FROM products WHERE product_code = 'PRD008'), 1, 750000, 20),

-- Order 23 - Nov 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202511001'), (SELECT product_id FROM products WHERE product_code = 'PRD002'), 2, 2200000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202511001'), (SELECT product_id FROM products WHERE product_code = 'PRD003'), 1, 490000, 15),

-- Order 24 - Nov 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202511002'), (SELECT product_id FROM products WHERE product_code = 'PRD010'), 1, 3290000, 0),
((SELECT order_id FROM orders WHERE order_number = 'ORD202511002'), (SELECT product_id FROM products WHERE product_code = 'PRD005'), 1, 2890000, 0);


-- Payments for all 24 orders
INSERT INTO payments (order_id, payment_method, amount, payment_status, payment_date, created_date)
VALUES 
-- Dec 2024
((SELECT order_id FROM orders WHERE order_number = 'ORD241203001'), N'Tiền mặt', 3740000, N'Đã thanh toán', '2024-12-03 10:30:00', '2024-12-03 10:30:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD241215002'), N'Chuyển khoản', 5580000, N'Đã thanh toán', '2024-12-15 14:20:00', '2024-12-15 14:20:00'),

-- Jan 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202501001'), N'Tiền mặt', 5270000, N'Đã thanh toán', '2025-01-14 11:20:00', '2025-01-14 11:20:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202501002'), N'Chuyển khoản', 3890000, N'Đã thanh toán', '2025-01-29 15:35:00', '2025-01-29 15:35:00'),

-- Feb 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202502001'), N'Tiền mặt', 4560000, N'Đã thanh toán', '2025-02-08 09:40:00', '2025-02-08 09:40:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202502002'), N'Chuyển khoản', 6820000, N'Đã thanh toán', '2025-02-23 13:25:00', '2025-02-23 13:25:00'),

-- Mar 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202503001'), N'Tiền mặt', 7180000, N'Đã thanh toán', '2025-03-11 10:00:00', '2025-03-11 10:00:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202503002'), N'Chuyển khoản', 5430000, N'Đã thanh toán', '2025-03-27 16:15:00', '2025-03-27 16:15:00'),

-- Apr 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202504001'), N'Tiền mặt', 6290000, N'Đã thanh toán', '2025-04-06 11:10:00', '2025-04-06 11:10:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202504002'), N'Chuyển khoản', 4120000, N'Đá thanh toán', '2025-04-21 14:40:00', '2025-04-21 14:40:00'),

-- May 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202505001'), N'Tiền mặt', 5840000, N'Đã thanh toán', '2025-05-09 09:30:00', '2025-05-09 09:30:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202505002'), N'Chuyển khoản', 3350000, N'Đã thanh toán', '2025-05-24 15:20:00', '2025-05-24 15:20:00'),

-- Jun 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202506001'), N'Tiền mặt', 7450000, N'Đã thanh toán', '2025-06-03 10:15:00', '2025-06-03 10:15:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202506002'), N'Chuyển khoản', 4980000, N'Đã thanh toán', '2025-06-19 13:50:00', '2025-06-19 13:50:00'),

-- Jul 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202507001'), N'Tiền mặt', 5290000, N'Đã thanh toán', '2025-07-12 11:30:00', '2025-07-12 11:30:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202507002'), N'Chuyển khoản', 3680000, N'Đã thanh toán', '2025-07-28 16:00:00', '2025-07-28 16:00:00'),

-- Aug 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202508001'), N'Tiền mặt', 6840000, N'Đã thanh toán', '2025-08-07 09:45:00', '2025-08-07 09:45:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202508002'), N'Chuyển khoản', 4050000, N'Đã thanh toán', '2025-08-18 14:25:00', '2025-08-18 14:25:00'),

-- Sep 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202509001'), N'Tiền mặt', 5780000, N'Đã thanh toán', '2025-09-10 10:20:00', '2025-09-10 10:20:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202509002'), N'Chuyển khoản', 3140000, N'Đã thanh toán', '2025-09-25 15:10:00', '2025-09-25 15:10:00'),

-- Oct 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202510001'), N'Tiền mặt', 3290000, N'Đã thanh toán', '2025-10-08 11:00:00', '2025-10-08 11:00:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202510002'), N'Chuyển khoản', 4540000, N'Đã thanh toán', '2025-10-22 13:30:00', '2025-10-22 13:30:00'),

-- Nov 2025
((SELECT order_id FROM orders WHERE order_number = 'ORD202511001'), N'Tiền mặt', 4690000, N'Đã thanh toán', '2025-11-05 09:15:00', '2025-11-05 09:15:00'),
((SELECT order_id FROM orders WHERE order_number = 'ORD202511002'), N'Chuyển khoản', 6180000, N'Đã thanh toán', '2025-11-20 16:45:00', '2025-11-20 16:45:00');
