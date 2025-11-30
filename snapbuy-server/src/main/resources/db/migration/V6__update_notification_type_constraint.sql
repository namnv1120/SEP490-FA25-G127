-- Update notification type constraint to include KHUYEN_MAI_HET_HAN (expired promotion)

-- Drop the existing constraint if it exists (SQL Server compatible syntax)
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_notification_type' AND parent_object_id = OBJECT_ID('notifications'))
BEGIN
    ALTER TABLE notifications DROP CONSTRAINT CK_notification_type;
END
GO

-- Add the new constraint with KHUYEN_MAI_HET_HAN
ALTER TABLE notifications ADD CONSTRAINT CK_notification_type
    CHECK ([type] IN ('TON_KHO_THAP', 'KHUYEN_MAI_SAP_HET_HAN', 'KHUYEN_MAI_HET_HAN', 'DON_HANG', 'THANH_TOAN', 'HE_THONG'));
GO

