-- V6: Thêm cột denomination_type để phân biệt mệnh giá khi mở ca (OPENING) hay đóng ca (CLOSING)
-- Mặc định là 'CLOSING' để tương thích với dữ liệu cũ

ALTER TABLE shift_cash_denominations
ADD denomination_type NVARCHAR(10) NOT NULL DEFAULT 'CLOSING';

-- Tạo index cho cột mới để tối ưu query
CREATE INDEX ix_shift_cash_denominations_type ON shift_cash_denominations (shift_id, denomination_type);

