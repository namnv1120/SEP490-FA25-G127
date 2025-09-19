CREATE TABLE users
(
    [user_id]      UNIQUEIDENTIFIER PRIMARY KEY,
    username       NVARCHAR(50) UNIQUE  NOT NULL,
    email          NVARCHAR(100) UNIQUE NOT NULL,
    [password]     NVARCHAR(255)        NOT NULL,
    full_name      NVARCHAR(100)        NOT NULL,
    phone          NVARCHAR(15)         NULL,
    avatar_url     NVARCHAR(500)        NULL,
    is_active      BIT       DEFAULT 1,
    email_verified BIT       DEFAULT 0,
    last_login     DATETIME2            NULL,
    created_at     DATETIME2 DEFAULT GETDATE(),
    updated_at     DATETIME2 DEFAULT GETDATE()
)

CREATE TABLE roles
(
    role_id       UNIQUEIDENTIFIER PRIMARY KEY,
    role_name     NVARCHAR(50) UNIQUE NOT NULL,
    display_name  NVARCHAR(100)       NOT NULL,
    [description] NVARCHAR(MAX),
    [status]      NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at    DATETIME2    DEFAULT GETDATE(),
    updated_at    DATETIME2    DEFAULT GETDATE()
);

CREATE TABLE [permissions]
(
    permission_id     UNIQUEIDENTIFIER PRIMARY KEY,
    [permission_name] NVARCHAR(100) UNIQUE NOT NULL,
    [resource]        NVARCHAR(50)         NOT NULL,
    [action]          NVARCHAR(50)         NOT NULL,
    [description]     NVARCHAR(MAX),
    created_at        DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE user_roles
(
    user_role_id UNIQUEIDENTIFIER PRIMARY KEY,
    [user_id]    UNIQUEIDENTIFIER NOT NULL,
    role_id      UNIQUEIDENTIFIER NOT NULL,
    assigned_by  UNIQUEIDENTIFIER,
    assigned_at  DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users (user_id),
    UNIQUE (user_id, role_id)
);

CREATE TABLE role_permissions
(
    role_permission_id UNIQUEIDENTIFIER PRIMARY KEY,
    role_id            UNIQUEIDENTIFIER NOT NULL,
    permission_id      UNIQUEIDENTIFIER NOT NULL,
    granted            BIT       DEFAULT 1, -- Cho phép hoặc từ chối
    created_at         DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES [permissions] (permission_id) ON DELETE CASCADE,
    UNIQUE (role_id, permission_id)
);

CREATE TABLE customers
(
    customer_id   UNIQUEIDENTIFIER PRIMARY KEY,
    customer_code NVARCHAR(20) UNIQUE NOT NULL,
    full_name     NVARCHAR(100)       NOT NULL,
    email         NVARCHAR(100) UNIQUE,
    phone         NVARCHAR(15),
    [address]     NVARCHAR(MAX),
    city          NVARCHAR(50),
    district      NVARCHAR(50),
    ward          NVARCHAR(50),
    date_of_birth DATE,
    gender        NVARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    customer_type NVARCHAR(20)   DEFAULT 'Individual' CHECK (customer_type IN ('Individual', 'Business')),
    tax_code      NVARCHAR(20),
    credit_limit  DECIMAL(15, 2) DEFAULT 0,
    [status]      NVARCHAR(20)   DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at    DATETIME2      DEFAULT GETDATE(),
    updated_at    DATETIME2      DEFAULT GETDATE()
);

CREATE TABLE employees
(
    [user_id]       UNIQUEIDENTIFIER UNIQUE NOT NULL,
    employee_id     UNIQUEIDENTIFIER PRIMARY KEY,
    employee_code   NVARCHAR(20) UNIQUE     NOT NULL,
    full_name       NVARCHAR(100)           NOT NULL,
    email           NVARCHAR(100) UNIQUE    NOT NULL,
    phone           NVARCHAR(15),
    [address]       NVARCHAR(MAX),
    hire_date       DATE                    NOT NULL,
    salary          DECIMAL(12, 2),
    commission_rate DECIMAL(5, 4) DEFAULT 0,
    [status]        NVARCHAR(20)  DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at      DATETIME2     DEFAULT GETDATE(),
    updated_at      DATETIME2     DEFAULT GETDATE(),
    FOREIGN KEY ([user_id]) REFERENCES users ([user_id]),
);

CREATE TABLE categories
(
    category_id   UNIQUEIDENTIFIER PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL,
    [description] NVARCHAR(MAX),
    parent_id     UNIQUEIDENTIFIER,
    [status]      NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at    DATETIME2    DEFAULT GETDATE(),
    updated_at    DATETIME2    DEFAULT GETDATE(),
    FOREIGN KEY (parent_id) REFERENCES categories (category_id)
);

CREATE TABLE suppliers
(
    supplier_id    UNIQUEIDENTIFIER PRIMARY KEY,
    supplier_code  NVARCHAR(20) UNIQUE NOT NULL,
    supplier_name  NVARCHAR(100)       NOT NULL,
    contact_person NVARCHAR(100),
    email          NVARCHAR(100),
    phone          NVARCHAR(15),
    [address]      NVARCHAR(MAX),
    tax_code       NVARCHAR(20),
    payment_terms  INT          DEFAULT 30,
    [status]       NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at     DATETIME2    DEFAULT GETDATE(),
    updated_at     DATETIME2    DEFAULT GETDATE()
);

CREATE TABLE products
(
    product_id      UNIQUEIDENTIFIER PRIMARY KEY,
    product_code    NVARCHAR(50) UNIQUE NOT NULL,
    product_name    NVARCHAR(200)       NOT NULL,
    [description]   NVARCHAR(MAX),
    category_id     UNIQUEIDENTIFIER    NOT NULL,
    supplier_id     UNIQUEIDENTIFIER,
    unit            NVARCHAR(20) DEFAULT N'Piece',
    cost_price      DECIMAL(12, 2)      NOT NULL,
    selling_price   DECIMAL(12, 2)      NOT NULL,
    [weight]        DECIMAL(8, 3),
    dimensions      NVARCHAR(50),
    barcode         NVARCHAR(50) UNIQUE,
    image_url       NVARCHAR(500),
    min_stock_level INT          DEFAULT 0,
    max_stock_level INT          DEFAULT 0,
    [status]        NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Discontinued')),
    created_at      DATETIME2    DEFAULT GETDATE(),
    updated_at      DATETIME2    DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES categories (category_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id)
);

CREATE TABLE warehouses
(
    warehouse_id   UNIQUEIDENTIFIER PRIMARY KEY,
    warehouse_code NVARCHAR(20) UNIQUE NOT NULL,
    warehouse_name NVARCHAR(100)       NOT NULL,
    [address]      NVARCHAR(MAX),
    capacity       DECIMAL(12, 2),
    [status]       NVARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at     DATETIME2    DEFAULT GETDATE(),
    updated_at     DATETIME2    DEFAULT GETDATE(),
);

CREATE TABLE inventory
(
    inventory_id       UNIQUEIDENTIFIER PRIMARY KEY,
    product_id         UNIQUEIDENTIFIER NOT NULL,
    warehouse_id       UNIQUEIDENTIFIER NOT NULL,
    quantity_on_hand   INT       DEFAULT 0,
    quantity_reserved  INT       DEFAULT 0,
    quantity_available AS (quantity_on_hand - quantity_reserved) PERSISTED,
    last_updated       DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products (product_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id),
    UNIQUE (product_id, warehouse_id)
);

CREATE TABLE orders
(
    order_id        UNIQUEIDENTIFIER PRIMARY KEY,
    order_number    NVARCHAR(30) UNIQUE NOT NULL,
    customer_id     UNIQUEIDENTIFIER    NOT NULL,
    employee_id     UNIQUEIDENTIFIER    NOT NULL,
    order_date      DATE                NOT NULL,
    order_status    NVARCHAR(20)                 DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Cancelled')),
    payment_method  NVARCHAR(20)                 DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Bank_Transfer', 'Credit_Card')),
    payment_status  NVARCHAR(20)                 DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partially_Paid', 'Paid', 'Refunded')),
    subtotal        DECIMAL(15, 2)      NOT NULL DEFAULT 0,
    tax_amount      DECIMAL(15, 2)      NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15, 2)      NOT NULL DEFAULT 0,
    total_amount    DECIMAL(15, 2)      NOT NULL DEFAULT 0,
    notes           NVARCHAR(MAX),
    created_at      DATETIME2                    DEFAULT GETDATE(),
    updated_at      DATETIME2                    DEFAULT GETDATE(),
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
    FOREIGN KEY (employee_id) REFERENCES employees (employee_id)
);

CREATE TABLE order_details
(
    order_detail_id  UNIQUEIDENTIFIER PRIMARY KEY,
    order_id         UNIQUEIDENTIFIER NOT NULL,
    product_id       UNIQUEIDENTIFIER NOT NULL,
    quantity         INT              NOT NULL,
    unit_price       DECIMAL(12, 2)   NOT NULL,
    discount_percent DECIMAL(5, 2)  DEFAULT 0,
    discount_amount  DECIMAL(12, 2) DEFAULT 0,
    line_total       AS ((quantity * unit_price) - discount_amount) PERSISTED,
    FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE TABLE purchase_orders
(
    purchase_order_id     UNIQUEIDENTIFIER PRIMARY KEY,
    purchase_order_number NVARCHAR(30) UNIQUE NOT NULL,
    supplier_id           UNIQUEIDENTIFIER    NOT NULL,
    employee_id           UNIQUEIDENTIFIER    NOT NULL,
    warehouse_id          UNIQUEIDENTIFIER    NOT NULL,
    order_date            DATE                NOT NULL,
    expected_date         DATE,
    received_date         DATE,
    [status]              NVARCHAR(20)                 DEFAULT 'Pending' CHECK (status IN ('Pending', 'Ordered',
                                                                                           'Partial_Received',
                                                                                           'Received', 'Cancelled')),
    subtotal              DECIMAL(15, 2)      NOT NULL DEFAULT 0,
    tax_amount            DECIMAL(15, 2)      NOT NULL DEFAULT 0,
    total_amount          DECIMAL(15, 2)      NOT NULL DEFAULT 0,
    notes                 NVARCHAR(MAX),
    created_at            DATETIME2                    DEFAULT GETDATE(),
    updated_at            DATETIME2                    DEFAULT GETDATE(),
    FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id),
    FOREIGN KEY (employee_id) REFERENCES employees (employee_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id)
);

CREATE TABLE purchase_order_details
(
    purchase_order_detail_id UNIQUEIDENTIFIER PRIMARY KEY,
    purchase_order_id        UNIQUEIDENTIFIER NOT NULL,
    product_id               UNIQUEIDENTIFIER NOT NULL,
    quantity_ordered         INT              NOT NULL,
    quantity_received        INT DEFAULT 0,
    unit_cost                DECIMAL(12, 2)   NOT NULL,
    line_total               AS (quantity_ordered * unit_cost) PERSISTED,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (purchase_order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE TABLE inventory_transactions
(
    transaction_id   UNIQUEIDENTIFIER PRIMARY KEY,
    product_id       UNIQUEIDENTIFIER NOT NULL,
    warehouse_id     UNIQUEIDENTIFIER NOT NULL,
    transaction_type NVARCHAR(20)     NOT NULL CHECK (transaction_type IN ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER')),
    reference_type   NVARCHAR(20)     NOT NULL CHECK (reference_type IN
                                                      ('PURCHASE_ORDER', 'SALES_ORDER', 'ADJUSTMENT', 'TRANSFER')),
    reference_id     BIGINT,
    quantity         INT              NOT NULL,
    unit_cost        DECIMAL(12, 2),
    transaction_date DATETIME2 DEFAULT GETDATE(),
    employee_id      UNIQUEIDENTIFIER,
    notes            NVARCHAR(MAX),
    FOREIGN KEY (product_id) REFERENCES products (product_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses (warehouse_id),
    FOREIGN KEY (employee_id) REFERENCES employees (employee_id)
);

CREATE TABLE payments
(
    payment_id       UNIQUEIDENTIFIER PRIMARY KEY,
    order_id         UNIQUEIDENTIFIER NOT NULL,
    payment_date     DATE             NOT NULL,
    payment_method   NVARCHAR(20)     NOT NULL CHECK (payment_method IN ('Cash', 'Bank_Transfer', 'Credit_Card')),
    amount           DECIMAL(15, 2)   NOT NULL,
    reference_number NVARCHAR(50),
    [status]         NVARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Cancelled')),
    notes            NVARCHAR(MAX),
    created_by       UNIQUEIDENTIFIER,
    created_at       DATETIME2    DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders (order_id),
    FOREIGN KEY (created_by) REFERENCES employees (employee_id)
);

CREATE TABLE promotions
(
    promotion_id     UNIQUEIDENTIFIER PRIMARY KEY,
    promotion_name   NVARCHAR(100) NOT NULL,
    [description]    NVARCHAR(MAX),
    promotion_type   NVARCHAR(20)  NOT NULL CHECK (promotion_type IN ('Percentage', 'Fixed_Amount', 'Buy_X_Get_Y')),
    discount_value   DECIMAL(10, 2),
    min_order_amount DECIMAL(12, 2) DEFAULT 0,
    [start_date]     DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    max_uses         INT            DEFAULT 0,
    used_count       INT            DEFAULT 0,
    [status]         NVARCHAR(20)   DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Expired')),
    created_at       DATETIME2      DEFAULT GETDATE(),
    updated_at       DATETIME2      DEFAULT GETDATE()
);

CREATE TABLE promotion_products
(
    promotion_product_id UNIQUEIDENTIFIER PRIMARY KEY,
    promotion_id         UNIQUEIDENTIFIER NOT NULL,
    product_id           UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions (promotion_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (product_id),
    UNIQUE (promotion_id, product_id)
);

CREATE NONCLUSTERED INDEX IX_users_username ON users (username);
CREATE NONCLUSTERED INDEX IX_users_email ON users (email);
CREATE NONCLUSTERED INDEX IX_users_active ON users (is_active);
CREATE NONCLUSTERED INDEX IX_customers_phone ON customers (phone);
CREATE NONCLUSTERED INDEX IX_customers_email ON customers (email);
CREATE NONCLUSTERED INDEX IX_customers_status ON customers (status);
CREATE NONCLUSTERED INDEX IX_products_category ON products (category_id);
CREATE NONCLUSTERED INDEX IX_products_supplier ON products (supplier_id);
CREATE NONCLUSTERED INDEX IX_products_barcode ON products (barcode);
CREATE NONCLUSTERED INDEX IX_products_status ON products (status);
CREATE NONCLUSTERED INDEX IX_orders_customer ON orders (customer_id);
CREATE NONCLUSTERED INDEX IX_orders_employee ON orders (employee_id);
CREATE NONCLUSTERED INDEX IX_orders_date ON orders (order_date);
CREATE NONCLUSTERED INDEX IX_orders_status ON orders (order_status);
CREATE NONCLUSTERED INDEX IX_inventory_product ON inventory (product_id);
CREATE NONCLUSTERED INDEX IX_inventory_warehouse ON inventory (warehouse_id);
CREATE NONCLUSTERED INDEX IX_transactions_product ON inventory_transactions (product_id);
CREATE NONCLUSTERED INDEX IX_transactions_date ON inventory_transactions (transaction_date);