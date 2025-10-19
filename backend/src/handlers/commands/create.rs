use crate::{
    AppState,
    models::UserModel,
    schema::{
        ApiResponse, ApiResult, CreateBudgetSchema, CreateCategorySchema, CreateExpenseSchema,
        CreateUserSchema,
    },
    utils::{
        hash_password,
        helper::{user_exists, validate_email, validate_name, validate_password},
        sign,
    },
};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};
use serde_json::json;
use std::sync::Arc;

pub async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateUserSchema>,
) -> ApiResult<serde_json::Value> {
    validate_name(&body.name)?;
    validate_password(&body.password)?;
    validate_email(&body.email)?;

    if user_exists(&state.db, &body.email).await? {
        return Err(ApiResponse::error(
            "User already exists",
            StatusCode::CONFLICT,
        ));
    }

    let password_hash = hash_password(&body.password)
        .map_err(|e| ApiResponse::error(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;

    let new_user = sqlx::query_as::<_, UserModel>(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    )
    .bind(body.name)
    .bind(body.email)
    .bind(password_hash)
    .fetch_one(&state.db)
    .await?;

    let token = sign(&new_user.user_id.to_string())
        .map_err(|e| ApiResponse::error(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;

    Ok(ApiResponse::success(
        json!({"user": new_user, "token": token}),
    ))
}

pub async fn create_expense(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateExpenseSchema>,
) -> impl IntoResponse {
    // TODO: implement
}

pub async fn create_budget(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateBudgetSchema>,
) -> impl IntoResponse {
    // TODO: implement
}

pub async fn create_category(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateCategorySchema>,
) -> impl IntoResponse {
    // TODO: implement
}
