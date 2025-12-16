-- Insert default admin account
-- Username: admin
-- Password: admin123
-- BCrypt hash generated with strength 10
INSERT INTO admin_accounts (account_id, username, password_hash, full_name, email, phone, is_active)
VALUES (
    NEWID(),
    'admin',
    '$2a$10$hT4v74kt0jYM1PZK5EyH5.4yMujsrqWJI4wqLchqbTk7lYTqePfZS', -- admin123
    N'Quản trị viên',
    'admin@snapbuy.com',
    '0900000000',
    1
);

INSERT INTO master_roles (role_name, description, active, is_system_role, display_order)
VALUES 
    (N'Quản trị viên', N'Quản trị viên hệ thống - Toàn quyền quản lý tất cả cửa hàng', 1, 1, 1),
    (N'Chủ cửa hàng', N'Chủ cửa hàng - Quản lý toàn bộ hoạt động kinh doanh của cửa hàng', 1, 1, 2),
    (N'Nhân viên kho', N'Nhân viên kho - Quản lý biên lai và các vấn đề liên quan đến hàng tồn kho', 1, 0, 3),
    (N'Nhân viên bán hàng', N'Nhân viên bán hàng - Xử lý đơn hàng và quản lý khách hàng', 1, 0, 4);
