#![allow(unused_variables)]

use crate::{
    AppState,
    models::user::UserModel,
    schema::{ApiResponse, user::*},
    utils::jwt::sign,
};
use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
};
use bcrypt::{DEFAULT_COST, hash};
use regex::Regex;
use serde_json::json;
use std::sync::Arc;

pub async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateUserSchema>,
) -> ApiResponse<serde_json::Value> {
    // validate the payload
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

    // hash password
    let password_hash = match hash(&body.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(_) => {
            return ApiResponse::error(
                "Failed to hash password",
                StatusCode::INTERNAL_SERVER_ERROR,
            );
        }
    };

    // create new user
    let new_user = match sqlx::query_as::<_, UserModel>(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    )
    .bind(body.name)
    .bind(body.email)
    .bind(password_hash)
    .fetch_one(&state.db)
    .await
    {
        Ok(u) => u,
        Err(err) => return ApiResponse::error(&err.to_string(), StatusCode::INTERNAL_SERVER_ERROR),
    };

    // create jwt token
    let token = match sign(new_user.user_id.to_string().clone()) {
        Ok(t) => t,
        Err(err) => {
            return ApiResponse::error(&err.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // return response
    return ApiResponse::success(
        json!({
            "user": new_user,
            "token": token
        })
    );
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
