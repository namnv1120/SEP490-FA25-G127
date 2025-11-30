-- Add account_id column to notifications table for personal notifications
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('notifications') AND name = 'account_id')
BEGIN
    ALTER TABLE notifications ADD account_id UNIQUEIDENTIFIER NULL;
END
GO

-- Make shop_id nullable (since notifications can be either shop-wide or personal)
ALTER TABLE notifications ALTER COLUMN shop_id UNIQUEIDENTIFIER NULL;
GO

-- Add index for account_id for better query performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_notifications_account_id' AND object_id = OBJECT_ID('notifications'))
BEGIN
    CREATE INDEX idx_notifications_account_id ON notifications(account_id);
END
GO

-- Update notification type constraint to include new purchase order types
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_notification_type' AND parent_object_id = OBJECT_ID('notifications'))
BEGIN
    ALTER TABLE notifications DROP CONSTRAINT CK_notification_type;
END
GO

ALTER TABLE notifications ADD CONSTRAINT CK_notification_type
    CHECK ([type] IN (
        'TON_KHO_THAP',
        'KHUYEN_MAI_SAP_HET_HAN',
        'KHUYEN_MAI_HET_HAN',
        'DON_HANG',
        'THANH_TOAN',
        'HE_THONG',
        'DON_DAT_HANG_CHO_DUYET',
        'DON_DAT_HANG_DA_DUYET',
        'DON_DAT_HANG_CHO_XAC_NHAN',
        'DON_DAT_HANG_HOAN_TAT'
    ));
GO

