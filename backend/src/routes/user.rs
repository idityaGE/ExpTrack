use axum::{Router, routing::post};
use std::sync::Arc;

use crate::{
    AppState,
    handlers::{create_user, login_user},
};

pub fn get_user_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/user", post(create_user))
        .route("/user/{email}", post(login_user))
}
