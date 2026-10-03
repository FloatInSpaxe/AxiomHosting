BEGIN;

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_username_not_blank CHECK (BTRIM(username) <> ''),
    CONSTRAINT users_email_format CHECK (email = LOWER(email) AND email LIKE '%_@_%._%'),
    CONSTRAINT users_password_hash_not_blank CHECK (BTRIM(password_hash) <> '')
);

CREATE UNIQUE INDEX users_username_unique_ci ON users (LOWER(username));
CREATE UNIQUE INDEX users_email_unique_ci ON users (LOWER(email));

CREATE TABLE plans (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    ram_mb INTEGER NOT NULL CHECK (ram_mb > 0),
    cpu_threads SMALLINT NOT NULL CHECK (cpu_threads > 0),
    storage_gb INTEGER NOT NULL CHECK (storage_gb > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT plans_name_not_blank CHECK (BTRIM(name) <> '')
);

CREATE TABLE servers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pterodactyl_server_id VARCHAR(100) UNIQUE,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT servers_name_not_blank CHECK (BTRIM(name) <> ''),
    CONSTRAINT servers_status_allowed CHECK (status IN ('pending', 'installing', 'running', 'stopped', 'suspended', 'error'))
);

CREATE INDEX servers_user_id_idx ON servers (user_id);
CREATE INDEX servers_status_idx ON servers (status);

CREATE TABLE credit_balances (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount <> 0),
    transaction_type VARCHAR(30) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT credit_transactions_type_not_blank CHECK (BTRIM(transaction_type) <> '')
);

CREATE INDEX credit_transactions_user_created_idx
    ON credit_transactions (user_id, created_at DESC);

CREATE TABLE subscriptions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT subscriptions_status_allowed CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired'))
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions (user_id);
CREATE INDEX subscriptions_plan_id_idx ON subscriptions (plan_id);
CREATE INDEX subscriptions_status_idx ON subscriptions (status);

CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER plans_set_updated_at
BEFORE UPDATE ON plans
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER servers_set_updated_at
BEFORE UPDATE ON servers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER credit_balances_set_updated_at
BEFORE UPDATE ON credit_balances
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER subscriptions_set_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO plans (name, ram_mb, cpu_threads, storage_gb, price)
VALUES
    ('Starter', 2048, 1, 20, 5.00),
    ('Standard', 4096, 2, 40, 10.00),
    ('Performance', 8192, 4, 80, 20.00)
ON CONFLICT (name) DO NOTHING;

COMMIT;
