use axum::{Router, routing::get};
use std::sync::Arc;

use crate::{
    AppState,
    handlers::{
        create_expense, delete_expense, get_all_expenses, get_expense_by_id,
        get_expenses_by_budget_id, update_expense,
    },
};

pub fn get_expense_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/expense", get(get_all_expenses).post(create_expense))
        .route(
            "/expense/{id}",
            get(get_expense_by_id)
                .put(update_expense)
                .delete(delete_expense),
        )
        .route(
            "/expense/budget/{budget_id}",
            get(get_expenses_by_budget_id),
        )
}
