use std::sync::Arc;

use axum::{Router, routing::get};

use super::health_check;
use crate::{
    AppState,
    routes::{get_budget_routes, get_category_routes, get_expense_routes, get_user_routes},
};

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health_check", get(health_check))
        .merge(get_user_routes())
        .merge(get_budget_routes())
        .merge(get_expense_routes())
        .merge(get_category_routes())
        .with_state(state)
}
