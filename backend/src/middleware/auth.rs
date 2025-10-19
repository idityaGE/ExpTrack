use crate::{AppState, models::UserModel, schema::ApiResponse, utils::verify};
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

    println!("Token {}", token);

    let user_id = match verify(&token) {
        Ok(c) => c,
        Err(err) => {
            return ApiResponse::<serde_json::Value>::error(&err, StatusCode::UNAUTHORIZED)
                .into_response();
        }
    };

    // TODO: Fetch from db and check if user exits ?
    let _user = match sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE user_id = $1")
        .bind(&user_id)
        .fetch_optional(&state.db)
        .await
    {
        Ok(u) => match u {
            Some(data) => data,
            None => {
                return ApiResponse::<serde_json::Value>::error(
                    "User doesn't exits",
                    StatusCode::CONFLICT,
                )
                .into_response();
            }
        },
        Err(err) => {
            return ApiResponse::<serde_json::Value>::error(
                &err.to_string(),
                StatusCode::INTERNAL_SERVER_ERROR,
            )
            .into_response();
        }
    };

    req.extensions_mut().insert(user_id);

    next.run(req).await
}
