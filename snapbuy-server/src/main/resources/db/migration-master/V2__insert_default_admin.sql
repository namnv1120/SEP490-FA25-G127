-- Insert default admin account
-- Username: admin
-- Password: 123456
-- BCrypt hash generated with strength 10
INSERT INTO admin_accounts (account_id, username, password_hash, full_name, email, phone, is_active)
VALUES (
    NEWID(),
    'admin',
    '$2a$10$qW/hFn1dQtWkrpuhQUUxXOYtdPBqIcPMJ1o573mtJgcK6.SL4lI/.', -- 123456
    N'Quản trị viên',
    'admin@snapbuy.com',
    '0900000000',
    1
);
