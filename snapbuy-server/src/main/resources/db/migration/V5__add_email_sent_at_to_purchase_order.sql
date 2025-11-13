-- V5__add_email_sent_at_to_purchase_order.sql  (SQL Server)

-- Thêm cột email_sent_at nếu CHƯA có
IF COL_LENGTH('dbo.purchase_order', 'email_sent_at') IS NULL
BEGIN
    ALTER TABLE dbo.purchase_order
        ADD email_sent_at DATETIME2 NULL;
END
GO

