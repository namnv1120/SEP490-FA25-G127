CREATE TABLE pos_shift
(
    shift_id             UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    account_id           UNIQUEIDENTIFIER NOT NULL,
    initial_cash         DECIMAL(18, 2)   NOT NULL    DEFAULT 0,
    closing_cash         DECIMAL(18, 2),
    opened_at            DATETIME2        NOT NULL    DEFAULT GETDATE(),
    closed_at            DATETIME2,
    status               NVARCHAR(10)    NOT NULL DEFAULT N'Mở',
    opened_by_account_id UNIQUEIDENTIFIER NULL,
    created_date         DATETIME2        NOT NULL    DEFAULT GETDATE(),
    updated_date         DATETIME2        NOT NULL    DEFAULT GETDATE(),
    closing_note         NVARCHAR(255)    NULL,
    FOREIGN KEY (account_id) REFERENCES accounts (account_id),
    FOREIGN KEY (opened_by_account_id) REFERENCES accounts (account_id)
);

CREATE INDEX ix_pos_shift_account_status ON pos_shift (account_id, status);

