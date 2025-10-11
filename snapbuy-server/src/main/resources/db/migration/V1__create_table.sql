CREATE TABLE accounts
(
    account_id    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    full_name     NVARCHAR(100)        NOT NULL,
    username      NVARCHAR(50) UNIQUE  NOT NULL,
    password_hash NVARCHAR(255)        NOT NULL,
    email         NVARCHAR(100) UNIQUE NOT NULL,
    phone         NVARCHAR(15)         NULL,
    avatar_url    NVARCHAR(500)        NULL,
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

CREATE TABLE [permissions]
(
    permission_id     UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [permission_name] NVARCHAR(50) NOT NULL,
    [description]     NVARCHAR(200),
    module            NVARCHAR(50),
    active            BIT                          DEFAULT 1
);

CREATE TABLE role_permission
(
    role_id       UNIQUEIDENTIFIER,
    permission_id UNIQUEIDENTIFIER,

    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles (role_id),
    FOREIGN KEY (permission_id) REFERENCES [permissions] (permission_id)
);

CREATE TABLE customers
(
    customer_id   UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    customer_code NVARCHAR(20) UNIQUE,
    full_name     NVARCHAR(50),
    phone         NVARCHAR(20),
    gender        NVARCHAR(6),
    active        BIT                          DEFAULT 1,
    created_date  DATETIME2                    DEFAULT GETDATE(),
    updated_date  DATETIME2                    DEFAULT GETDATE()
);

CREATE TABLE categories
(
    category_id        UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    category_name      NVARCHAR(100)    NOT NULL,
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
    product_code  NVARCHAR(50) UNIQUE NOT NULL,
    [description] NVARCHAR(MAX),
    category_id   UNIQUEIDENTIFIER    NOT NULL,
    supplier_id   UNIQUEIDENTIFIER,
    unit          NVARCHAR(20)                 DEFAULT N'Piece',
    dimensions    NVARCHAR(50),
    image_url     NVARCHAR(500),
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
    tax_rate     DECIMAL(5, 2)                DEFAULT 0,
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
    [status]              NVARCHAR(20)                 DEFAULT 'PENDING', -- PENDING, APPROVED, RECEIVED, CANCELLED
    total_amount          DECIMAL(18, 2)      NOT NULL DEFAULT 0,
    tax_amount            DECIMAL(18, 2)               DEFAULT 0,
    notes                 NVARCHAR(500),
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
    total_price              AS (quantity * unit_price),

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
    order_status    NVARCHAR(20)                 DEFAULT 'PENDING', -- PENDING, CONFIRMED, COMPLETED, CANCELLED
    payment_status  NVARCHAR(20)                 DEFAULT 'UNPAID',  -- UNPAID, PARTIAL, PAID, REFUNDED
    total_amount    DECIMAL(18, 2)      NOT NULL DEFAULT 0,
    discount_amount DECIMAL(18, 2)               DEFAULT 0,
    tax_amount      DECIMAL(18, 2)               DEFAULT 0,
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
    payment_method        NVARCHAR(30)     NOT NULL,                      -- CASH, CARD, BANK_TRANSFER, E_WALLET
    payment_date          DATETIME2                    DEFAULT GETDATE(),
    amount                DECIMAL(18, 2)   NOT NULL,
    payment_status        NVARCHAR(20)                 DEFAULT 'PENDING', -- PENDING, SUCCESS, FAILED, CANCELLED
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
    discount_type  NVARCHAR(20)   NOT NULL, -- PERCENT, FIXED
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
CREATE INDEX ix_inventory_transaction_product_id ON inventory_transaction (product_id);

