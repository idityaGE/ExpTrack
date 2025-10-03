use std::sync::Arc;

use axum::{
    Router,
    routing::get,
};

use super::health_check;
use crate::AppState;

pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/healthchecker", get(health_check))
        .with_state(state)
}
