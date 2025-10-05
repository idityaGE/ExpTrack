use axum::response::IntoResponse;

pub async fn get_all_expenses() -> impl IntoResponse {}

pub async fn get_expense_by_id() -> impl IntoResponse {}

pub async fn get_all_categories() -> impl IntoResponse {}

pub async fn get_all_budgets() -> impl IntoResponse {}

pub async fn get_budget_by_id() -> impl IntoResponse {}

pub async fn login_user() -> impl IntoResponse {}