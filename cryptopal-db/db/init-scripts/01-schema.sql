CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    balance       NUMERIC(18,8) NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    asset_symbol  VARCHAR(10) NOT NULL,
    amount        NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    UNIQUE (user_id, asset_symbol)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

CREATE TABLE transactions (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type          VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    asset_symbol  VARCHAR(10) NOT NULL,
    volume        NUMERIC(18,8) NOT NULL CHECK (volume > 0),
    price         NUMERIC(18,8) NOT NULL CHECK (price > 0),
    executed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_executed_at ON transactions(executed_at);

CREATE TABLE price_history (
    id            BIGSERIAL PRIMARY KEY,
    asset_symbol  VARCHAR(10) NOT NULL,
    price         NUMERIC(18,8) NOT NULL CHECK (price > 0),
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_history_asset_time ON price_history(asset_symbol, recorded_at);