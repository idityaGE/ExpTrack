use std::sync::Arc;

use axum::{Router, middleware::from_fn_with_state, routing::get};

use super::health_check;
use crate::{
    AppState,
    middleware::auth::require_auth,
    routes::{get_budget_routes, get_category_routes, get_expense_routes, get_user_routes},
};

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .merge(get_expense_routes())
        .merge(get_budget_routes())
        .merge(get_category_routes())
        .route("/health_check", get(health_check))
        .layer(from_fn_with_state(Arc::clone(&state), require_auth))
        .merge(get_user_routes())
        .with_state(state)
}
