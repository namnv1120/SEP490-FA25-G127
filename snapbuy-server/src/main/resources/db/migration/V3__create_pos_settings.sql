CREATE TABLE pos_settings
(
    settings_id      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    account_id       UNIQUEIDENTIFIER NOT NULL UNIQUE,
    tax_percent      DECIMAL(5, 2)   NOT NULL DEFAULT 0,
    discount_percent DECIMAL(5, 2)   NOT NULL DEFAULT 0,
    created_date     DATETIME2                   DEFAULT GETDATE(),
    updated_date     DATETIME2                   DEFAULT GETDATE(),

    FOREIGN KEY (account_id) REFERENCES accounts (account_id)
);

CREATE INDEX ix_pos_settings_account_id ON pos_settings (account_id);

