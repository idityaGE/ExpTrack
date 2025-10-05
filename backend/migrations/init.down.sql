DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS budgets;

DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at ON users;
DROP TRIGGER IF EXISTS set_updated_at ON categories;
DROP TRIGGER IF EXISTS set_updated_at ON expenses;
DROP TRIGGER IF EXISTS set_updated_at ON budgets;

DROP INDEX IF EXISTS idx_expense_user;
DROP INDEX IF EXISTS idx_expense_category;
DROP INDEX IF EXISTS idx_budget_user;