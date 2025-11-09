-- V4__add_barcode_to_products.sql  (SQL Server)

-- [FIX] Thêm cột barcode nếu CHƯA có
IF COL_LENGTH('dbo.products', 'barcode') IS NULL
BEGIN
ALTER TABLE dbo.products
    ADD barcode NVARCHAR(100) NULL;  -- [FIX] idempotent
END
GO

-- [FIX] Tạo UNIQUE INDEX có điều kiện (chỉ enforce khi barcode NOT NULL)
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'UX_products_barcode'
      AND object_id = OBJECT_ID(N'dbo.products')
)
BEGIN
CREATE UNIQUE INDEX UX_products_barcode
    ON dbo.products(barcode)
    WHERE barcode IS NOT NULL;
END
GO

-- [FIX] Index phục vụ tìm kiếm theo barcode (non-unique)
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_products_barcode_search'
      AND object_id = OBJECT_ID(N'dbo.products')
)
BEGIN
CREATE INDEX IX_products_barcode_search
    ON dbo.products(barcode);
END
GO
