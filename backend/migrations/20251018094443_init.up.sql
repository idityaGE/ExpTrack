-- Add migration script here

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USER TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id       UUID PRIMARY KEY DEFAULT (uuid_generate_v4()),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORY TABLE
CREATE TABLE IF NOT EXISTS categories (
    category_id    SERIAL PRIMARY KEY,
    user_id        UUID, 
    category_name  VARCHAR(100) NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_category UNIQUE (user_id, category_name)
);

-- BUDGET TABLE
CREATE TABLE IF NOT EXISTS budgets (
    budget_id   UUID PRIMARY KEY DEFAULT (uuid_generate_v4()),
    name        VARCHAR(200) NOT NULL,
    amount      BIGINT NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    user_id     UUID NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- EXPENSE TABLE
CREATE TABLE IF NOT EXISTS expenses (
    expense_id   UUID PRIMARY KEY DEFAULT (uuid_generate_v4()),
    name         VARCHAR(200) NOT NULL,
    amount       BIGINT NOT NULL,
    date         DATE NOT NULL,
    description  TEXT,
    category_id  INT,
    user_id      UUID NOT NULL,
    budget_id    UUID,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    CONSTRAINT fk_expense_budget FOREIGN KEY (budget_id) REFERENCES budgets(budget_id) ON DELETE SET NULL
);

-- INSERT GLOBAL CATEGORIES
INSERT INTO categories (user_id, category_name) VALUES
    (NULL, 'Food'),
    (NULL, 'Transportation'),
    (NULL, 'Utilities'),
    (NULL, 'Entertainment'),
    (NULL, 'Healthcare'),
    (NULL, 'Education'),
    (NULL, 'Miscellaneous');

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_expense_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expense_budget ON expenses(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_user ON budgets(user_id);

-- TRIGGER FUNCTION FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
