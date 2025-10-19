use crate::{AppState, schema::ApiResponse, utils::jwt::verify};
use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use std::sync::Arc;

pub async fn require_auth(
    mut req: Request,
    next: Next,
    State(_state): State<Arc<AppState>>,
) -> Response {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(h) if h.starts_with("Bearer ") => h.trim_start_matches("Bearer ").to_string(),
        _ => {
            return ApiResponse::<serde_json::Value>::error(
                "Auth token missing",
                StatusCode::UNAUTHORIZED,
            )
            .into_response();
        }
    };

    let jwt_payload = match verify(&token) {
        Ok(c) => c,
        Err(_) => {
            return ApiResponse::<serde_json::Value>::error(
                "Failed verify token, recheck",
                StatusCode::UNAUTHORIZED,
            )
            .into_response();
        }
    };

    // TODO: Fetch from db and check if user exits ?

    req.extensions_mut().insert(jwt_payload);

    next.run(req).await
}
