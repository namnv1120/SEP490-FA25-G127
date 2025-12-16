CREATE TABLE accounts
(
    account_id    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    full_name     NVARCHAR(100)       NOT NULL,
    username      NVARCHAR(50) UNIQUE NOT NULL,
    password_hash NVARCHAR(255)       NOT NULL,
    email         NVARCHAR(100)       NULL,
    phone         NVARCHAR(15)        NULL,
    avatar_url    NVARCHAR(500)       NULL,
    token_version INT                 NOT NULL DEFAULT 0,
    active        BIT                          DEFAULT 1,
    created_date  DATETIME2                    DEFAULT GETDATE(),
    updated_date  DATETIME2                    DEFAULT GETDATE(),
);

CREATE TABLE roles
(
    role_id       UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    role_name     NVARCHAR(50) NOT NULL,
    [description] NVARCHAR(MAX),
    active        BIT                          DEFAULT 1,
    created_date  DATETIME2                    DEFAULT GETDATE()
);

CREATE TABLE account_roles
(
    account_id UNIQUEIDENTIFIER NOT NULL,
    role_id    UNIQUEIDENTIFIER NOT NULL,

    PRIMARY KEY (account_id, role_id),
    FOREIGN KEY (account_id) REFERENCES accounts (account_id),
    FOREIGN KEY (role_id) REFERENCES roles (role_id)
);

CREATE TABLE customers
(
    customer_id   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    customer_code NVARCHAR(20) UNIQUE,
    full_name     NVARCHAR(50),
    phone         NVARCHAR(20),
    gender        NVARCHAR(6),
    points        INT NOT NULL                 DEFAULT 0,
    active        BIT                          DEFAULT 1,
    created_date  DATETIME2                    DEFAULT GETDATE(),
    updated_date  DATETIME2                    DEFAULT GETDATE()
);

CREATE TABLE categories
(
    category_id        UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    category_name      NVARCHAR(100)    NOT NULL UNIQUE,
    [description]      NVARCHAR(MAX),
    parent_category_id UNIQUEIDENTIFIER NULL,
    active             BIT                          DEFAULT 1,
    created_date       DATETIME2                    DEFAULT GETDATE(),
    updated_date       DATETIME2                    DEFAULT GETDATE(),

    FOREIGN KEY (parent_category_id) REFERENCES categories (category_id)
);

CREATE TABLE suppliers
(
    supplier_id   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    supplier_code NVARCHAR(20) UNIQUE,
    supplier_name NVARCHAR(100) NOT NULL,
    phone         NVARCHAR(20),
    email         NVARCHAR(100),
    [address]     NVARCHAR(100),
    city          NVARCHAR(50),
    ward          NVARCHAR(50),
    active        BIT                          DEFAULT 1,
    created_date  DATETIME2                    DEFAULT GETDATE(),
    updated_date  DATETIME2                    DEFAULT GETDATE()
);

CREATE TABLE products
(
    product_id    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    product_name  NVARCHAR(200)       NOT NULL,
    product_code  NVARCHAR(20) UNIQUE NOT NULL,
    [description] NVARCHAR(MAX),
    category_id   UNIQUEIDENTIFIER    NOT NULL,
    supplier_id   UNIQUEIDENTIFIER,
    unit          NVARCHAR(20)                 DEFAULT N'Cái',
    dimensions    NVARCHAR(50),
    image_url     NVARCHAR(500),
    barcode       NVARCHAR(20)        NULL,
    active        BIT                          DEFAULT 1,
    created_date  DATETIME2                    DEFAULT GETDATE(),
    updated_date  DATETIME2                    DEFAULT GETDATE(),

    FOREIGN KEY (category_id) REFERENCES categories (category_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id)
);

CREATE TABLE product_price
(
    price_id     UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    product_id   UNIQUEIDENTIFIER NOT NULL,
    unit_price   DECIMAL(18, 2)   NOT NULL,
    cost_price   DECIMAL(18, 2),
    valid_from   DATETIME2        NOT NULL    DEFAULT GETDATE(),
    valid_to     DATETIME2        NULL,
    created_date DATETIME2                    DEFAULT GETDATE(),

    FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE TABLE purchase_order
(
    purchase_order_id     UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    purchase_order_number NVARCHAR(20) UNIQUE NOT NULL,
    supplier_id           UNIQUEIDENTIFIER    NOT NULL,
    account_id            UNIQUEIDENTIFIER    NOT NULL,
    order_date            DATETIME2                    DEFAULT GETDATE(),
    received_date         DATETIME2,
    [status]              NVARCHAR(20)                 DEFAULT N'Chờ duyệt',
    total_amount          DECIMAL(18, 2)      NOT NULL DEFAULT 0,
    tax_amount            DECIMAL(18, 2)               DEFAULT 0,
    notes                 NVARCHAR(500),
    email_sent_at         DATETIME2           NULL,
    created_date          DATETIME2                    DEFAULT GETDATE(),
    updated_date          DATETIME2                    DEFAULT GETDATE(),

    FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id),
    FOREIGN KEY (account_id) REFERENCES accounts (account_id)
);

CREATE TABLE purchase_order_detail
(
    purchase_order_detail_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    purchase_order_id        UNIQUEIDENTIFIER NOT NULL,
    product_id               UNIQUEIDENTIFIER NOT NULL,
    quantity                 INT              NOT NULL,
    unit_price               DECIMAL(18, 2)   NOT NULL,
    received_quantity        INT                          DEFAULT 0,
    total_price              AS (received_quantity * unit_price),

    FOREIGN KEY (purchase_order_id) REFERENCES purchase_order (purchase_order_id),
    FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE TABLE inventory
(
    inventory_id      UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    product_id        UNIQUEIDENTIFIER NOT NULL,
    quantity_in_stock INT              NOT NULL    DEFAULT 0,
    minimum_stock     INT,
    maximum_stock     INT,
    reorder_point     INT,
    last_updated      DATETIME2                    DEFAULT GETDATE(),

    FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE TABLE inventory_transaction
(
    transaction_id   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    product_id       UNIQUEIDENTIFIER NOT NULL,
    account_id       UNIQUEIDENTIFIER NOT NULL,
    transaction_type NVARCHAR(20)     NOT NULL,
    quantity         INT              NOT NULL,
    unit_price       DECIMAL(18, 2),
    reference_type   NVARCHAR(20),
    reference_id     UNIQUEIDENTIFIER,
    notes            NVARCHAR(500),
    transaction_date DATETIME2                    DEFAULT GETDATE(),

    FOREIGN KEY (account_id) REFERENCES accounts (account_id),
    FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE TABLE orders
(
    order_id        UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    order_number    NVARCHAR(20) UNIQUE NOT NULL,
    customer_id     UNIQUEIDENTIFIER    NOT NULL,
    account_id      UNIQUEIDENTIFIER    NOT NULL,
    order_date      DATETIME2                    DEFAULT GETDATE(),
    order_status    NVARCHAR(20)                 DEFAULT N'Chờ xác nhận',
    payment_status  NVARCHAR(20)                 DEFAULT N'Chưa thanh toán',
    total_amount    DECIMAL(18, 2)      NOT NULL DEFAULT 0,
    discount_amount DECIMAL(18, 2)               DEFAULT 0,
    tax_amount      DECIMAL(18, 2)               DEFAULT 0,
    points_redeemed INT                 NULL     DEFAULT 0,
    points_earned   INT                 NULL     DEFAULT 0,
    notes           NVARCHAR(500),
    created_date    DATETIME2                    DEFAULT GETDATE(),
    updated_date    DATETIME2                    DEFAULT GETDATE(),

    FOREIGN KEY (account_id) REFERENCES accounts (account_id),
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
);

CREATE TABLE order_detail
(
    order_detail_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    order_id        UNIQUEIDENTIFIER NOT NULL,
    product_id      UNIQUEIDENTIFIER NOT NULL,
    quantity        INT              NOT NULL,

    unit_price      DECIMAL(18, 2)   NOT NULL,
    discount        DECIMAL(5, 2)                DEFAULT 0,
    total_price     AS (quantity * unit_price * (1 - discount / 100)),

    FOREIGN KEY (order_id) REFERENCES orders (order_id),
    FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE TABLE payments
(
    payment_id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    order_id              UNIQUEIDENTIFIER NOT NULL,
    payment_method        NVARCHAR(30)     NOT NULL,
    payment_date          DATETIME2                    DEFAULT GETDATE(),
    amount                DECIMAL(18, 2)   NOT NULL,
    payment_status        NVARCHAR(20)                 DEFAULT N'Chưa thanh toán',
    transaction_reference NVARCHAR(100),
    notes                 NVARCHAR(500),
    created_date          DATETIME2                    DEFAULT GETDATE(),

    FOREIGN KEY (order_id) REFERENCES orders (order_id)
);

CREATE TABLE promotions
(
    promotion_id   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    promotion_name NVARCHAR(200)  NOT NULL,
    [description]  NVARCHAR(500),
    discount_type  NVARCHAR(20)   NOT NULL,
    discount_value DECIMAL(18, 2) NOT NULL,
    [start_date]   DATETIME2      NOT NULL,
    end_date       DATETIME2      NOT NULL,
    active         BIT                          DEFAULT 1,
    created_date   DATETIME2                    DEFAULT GETDATE()
);

CREATE TABLE promotion_product
(
    promotion_id UNIQUEIDENTIFIER NOT NULL,
    product_id   UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (promotion_id, product_id),
    FOREIGN KEY (promotion_id) REFERENCES promotions (promotion_id),
    FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE INDEX ix_product_category_id ON products (category_id);
CREATE INDEX ix_product_supplier_id ON products (supplier_id);
CREATE INDEX ix_product_product_code ON products (product_code);
CREATE INDEX ix_inventory_product_id ON inventory (product_id);
CREATE INDEX ix_order_customer_id ON orders (customer_id);
CREATE INDEX ix_order_order_date ON orders (order_date);
CREATE INDEX ix_order_order_number ON orders (order_number);
CREATE INDEX ix_order_detail_order_id ON order_detail (order_id);
CREATE INDEX ix_order_detail_product_id ON order_detail (product_id);
CREATE INDEX ix_payment_order_id ON payments (order_id);
CREATE INDEX ix_account_username ON accounts (username);
CREATE UNIQUE INDEX UX_accounts_email ON accounts (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX UX_accounts_phone ON accounts (phone) WHERE phone IS NOT NULL;
CREATE INDEX ix_inventory_transaction_product_id ON inventory_transaction (product_id);
CREATE UNIQUE INDEX UX_products_barcode ON products (barcode) WHERE barcode IS NOT NULL;
CREATE UNIQUE INDEX UX_customers_phone ON customers (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX UX_suppliers_phone ON suppliers (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX UX_suppliers_email ON suppliers (email) WHERE email IS NOT NULL;
CREATE INDEX ix_inventory_transaction_date ON inventory_transaction (transaction_date DESC);
CREATE INDEX ix_product_price_product_valid ON product_price (product_id, valid_from DESC);
CREATE INDEX ix_promotions_active_dates ON promotions (active, start_date, end_date);
CREATE INDEX ix_purchase_order_status ON purchase_order (status, order_date DESC);
CREATE INDEX ix_orders_account_date ON orders (account_id, order_date DESC);

-- Notifications Table
CREATE TABLE notifications
(
    notification_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [type]          NVARCHAR(50)     NOT NULL,
    [message]       NVARCHAR(255)    NOT NULL,
    [description]   NVARCHAR(500)    NULL,
    is_read         BIT              NOT NULL    DEFAULT 0,
    shop_id         UNIQUEIDENTIFIER NULL,
    account_id      UNIQUEIDENTIFIER NULL,
    reference_id    UNIQUEIDENTIFIER NULL,
    created_at      DATETIME2        NOT NULL    DEFAULT GETDATE(),

    FOREIGN KEY (shop_id) REFERENCES accounts (account_id),
    FOREIGN KEY (account_id) REFERENCES accounts (account_id),

    CONSTRAINT CK_notification_type CHECK ([type] IN (
        'TON_KHO_THAP',
        'KHUYEN_MAI_SAP_HET_HAN',
        'KHUYEN_MAI_HET_HAN',
        'DON_HANG',
        'THANH_TOAN',
        'HE_THONG',
        'DON_DAT_HANG_CHO_DUYET',
        'DON_DAT_HANG_DA_DUYET',
        'DON_DAT_HANG_CHO_XAC_NHAN',
        'DON_DAT_HANG_HOAN_TAT',
        'DON_DAT_HANG_BI_TU_CHOI',
        'DON_DAT_HANG_BI_HUY'
    ))
);

-- Indexes for notifications
CREATE INDEX ix_notifications_shop_id ON notifications (shop_id);
CREATE INDEX ix_notifications_account_id ON notifications (account_id);
CREATE INDEX ix_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX ix_notifications_is_read ON notifications (is_read);
CREATE INDEX ix_notifications_type ON notifications ([type]);
CREATE INDEX ix_notifications_shop_read_created ON notifications (shop_id, is_read, created_at DESC);

INSERT INTO customers (customer_id, customer_code, full_name, phone, active)
VALUES ('00000000-0000-0000-0000-000000000001',
        'DEFAULT',
        N'Khách lẻ',
        N'Khách lẻ',
        1);