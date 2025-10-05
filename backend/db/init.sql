-- NO NEED TO ADD THE CREATE DATABASE IT WILL CREATE FROM THE DATABASE_URL IF NOT EXISTS 

-- USER TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id      SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    passwordhash VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORY TABLE
CREATE TABLE IF NOT EXISTS categories (
    category_id   SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EXPENSE TABLE
CREATE TABLE IF NOT EXISTS expenses (
    expense_id   SERIAL PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    amount       DECIMAL(10,2) NOT NULL,
    date         DATE NOT NULL,
    description  TEXT,
    category_id  INT,
    user_id      INT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- BUDGET TABLE
CREATE TABLE IF NOT EXISTS budgets (
    budget_id   SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    user_id     INT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_expense_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_budget_user ON budgets(user_id);

-- TRIGGERS FOR AUTO-UPDATING updated_at COLUMN
-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();