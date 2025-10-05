use axum::{Router, routing::get};
use std::sync::Arc;

use crate::{
    AppState,
    handlers::{create_budget, delete_budget, get_all_budgets, get_budget_by_id, update_budget},
};

pub fn get_budget_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/budget", get(get_all_budgets).post(create_budget))
        .route(
            "/budget/{id}",
            get(get_budget_by_id)
                .put(update_budget)
                .delete(delete_budget),
        )
}
