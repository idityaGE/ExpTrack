use crate::{AppState, schema::ApiResponse, utils::{verify, helper::get_user_by_id}};
use axum::{
    body::Body,
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use std::sync::Arc;

pub async fn require_auth(
    State(state): State<Arc<AppState>>,
    mut req: Request<Body>,
    next: Next,
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

    let user_id = match verify(&token) {
        Ok(c) => c,
        Err(err) => {
            return ApiResponse::<serde_json::Value>::error(&err, StatusCode::UNAUTHORIZED)
                .into_response();
        }
    };

    let _user = match get_user_by_id(&state.db, &user_id).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            return ApiResponse::<serde_json::Value>::error(
                "User doesn't exist",
                StatusCode::CONFLICT,
            )
            .into_response();
        }
        Err(err) => {
            return err.into_response();
        }
    };

    req.extensions_mut().insert(user_id);

    next.run(req).await
}
