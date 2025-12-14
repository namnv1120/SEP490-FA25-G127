CREATE TABLE shift_cash_denominations
(
    id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    shift_id          UNIQUEIDENTIFIER NOT NULL,
    denomination      INT              NOT NULL,              -- Mệnh giá: 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000
    quantity          INT              NOT NULL    DEFAULT 0, -- Số lượng tờ
    total_value       DECIMAL(18, 2)   NOT NULL    DEFAULT 0, -- Tổng giá trị = denomination * quantity
    denomination_type NVARCHAR(10) NOT NULL DEFAULT 'Đóng',
    created_date      DATETIME2        NOT NULL    DEFAULT GETDATE(),
    FOREIGN KEY (shift_id) REFERENCES pos_shift (shift_id) ON DELETE CASCADE
);

CREATE INDEX ix_shift_cash_denominations_shift ON shift_cash_denominations (shift_id);
CREATE INDEX ix_shift_cash_denominations_type ON shift_cash_denominations (shift_id, denomination_type);

-- Thêm comment
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Lưu chi tiết số lượng tờ tiền theo mệnh giá khi đóng ca', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'shift_cash_denominations';

