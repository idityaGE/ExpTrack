use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;

use crate::{
    AppState, ok_or_err,
    schema::{ApiResponse, ApiResult, LoginUserSchema},
    utils::{
        helper::{get_user_by_email, validate_email},
        sign, verify_hash_password,
    },
};

pub async fn get_all_expenses() -> impl IntoResponse {}

pub async fn get_expense_by_id() -> impl IntoResponse {}

pub async fn get_all_categories() -> impl IntoResponse {}

pub async fn get_all_budgets() -> impl IntoResponse {}

pub async fn get_budget_by_id() -> impl IntoResponse {}

pub async fn login_user(
    Path(email): Path<String>,
    State(state): State<Arc<AppState>>,
    Json(body): Json<LoginUserSchema>,
) -> ApiResult<serde_json::Value> {
    validate_email(&email)?;

    let user = get_user_by_email(&state.db, &email).await?;

    if user.is_none() {
        return Err(ApiResponse::error(
            "User doesn't exists",
            StatusCode::UNAUTHORIZED,
        ));
    }

    let user = user.unwrap();

    let password_matches = ok_or_err!(
        verify_hash_password(&body.password, &user.password_hash),
        "Failed to verify password",
        StatusCode::INTERNAL_SERVER_ERROR
    );

    if !password_matches {
        return Err(ApiResponse::error(
            "Password doesn't match, please check again",
            StatusCode::UNAUTHORIZED,
        ));
    }

    let token = sign(&user.user_id.to_string())
        .map_err(|e| ApiResponse::error(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;

    // Return success response
    Ok(ApiResponse::success(json!({
        "token": token,
        "user": user
    })))
}
