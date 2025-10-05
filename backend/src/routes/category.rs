use axum::{
    Router,
    routing::{delete, get},
};
use std::sync::Arc;

use crate::{
    AppState,
    handlers::{create_category, delete_category, get_all_categories},
};

pub fn get_category_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/category", get(get_all_categories).post(create_category))
        .route("/category/:id", delete(delete_category))
}
