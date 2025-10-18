use std::sync::Arc;

use crate::{
    AppState,
    models::user::UserModel,
    schema::{ApiResponse, user::*},
};
use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use regex::Regex;

pub async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateUserSchema>,
) -> ApiResponse<String> {
    // validate the
    if body.name.len() < 2 {
        return ApiResponse::error("name min length 2", StatusCode::BAD_REQUEST);
    } else if body.password.len() < 8 {
        return ApiResponse::error("password min length 8", StatusCode::BAD_REQUEST);
    }

    let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$").unwrap();
    let is_valid_email = email_regex.is_match(&body.email);
    if !is_valid_email {
        return ApiResponse::error("Not a valid email", StatusCode::BAD_REQUEST);
    }

    // check if user already exits
    let user_exists = sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE email = $1")
        .bind(&body.email)
        .fetch_optional(&state.db)
        .await;

    match user_exists {
        Ok(Some(_)) => {
            return ApiResponse::error("User already exists", StatusCode::CONFLICT);
        }
        Ok(None) => {
            // User doesn't exist, continue with creation
        }
        Err(_e) => {
            return ApiResponse::error("Database error", StatusCode::INTERNAL_SERVER_ERROR);
        }
    }

    // create new user

    // create jwt token

    // return response
    return ApiResponse::success("Good".to_string());
}

pub async fn create_expense(
    State(state): State<Arc<AppState>>,
    Json(body): Json<serde_json::Value>,
) -> impl IntoResponse {
}

pub async fn create_budget(
    State(state): State<Arc<AppState>>,
    Json(body): Json<serde_json::Value>,
) -> impl IntoResponse {
}

pub async fn create_category(
    State(state): State<Arc<AppState>>,
    Json(body): Json<serde_json::Value>,
) -> impl IntoResponse {
}
