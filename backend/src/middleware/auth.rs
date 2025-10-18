use crate::{schema::ApiResponse, utils::jwt::verify};
use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};

pub async fn require_auth(mut req: Request, next: Next) -> Response {
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(h) if h.starts_with("Bearer ") => h.trim_start_matches("Bearer ").to_string(),
        _ => {
            return ApiResponse::<serde_json::Value>::error(
                "Invalid Token",
                StatusCode::UNAUTHORIZED,
            )
            .into_response();
        }
    };

    let user_email = match verify(&token) {
        Ok(c) => c,
        Err(_) => {
            return ApiResponse::<serde_json::Value>::error(
                "Failed verify token, recheck",
                StatusCode::UNAUTHORIZED,
            )
            .into_response();
        }
    };

    req.extensions_mut().insert(user_email);

    next.run(req).await
}
