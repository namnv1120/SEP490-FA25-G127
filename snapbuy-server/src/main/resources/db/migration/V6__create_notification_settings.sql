-- Create notification_settings table
CREATE TABLE notification_settings (
    settings_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    account_id UNIQUEIDENTIFIER NOT NULL UNIQUE,
    low_stock_enabled BIT NOT NULL DEFAULT 1,
    promotion_enabled BIT NOT NULL DEFAULT 1,
    purchase_order_enabled BIT NOT NULL DEFAULT 1,
    created_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_notification_settings_account FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

-- Create index on account_id for faster lookups
CREATE INDEX IX_notification_settings_account_id ON notification_settings(account_id);



