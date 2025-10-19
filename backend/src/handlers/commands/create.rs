use crate::{
    AppState,
    models::user::UserModel,
    schema::{ApiResponse, user::*},
    utils::{
        hash::hash_password,
        jwt::{JwtPayload, sign},
        pattern::is_valid_email,
    },
};
use axum::{Json, extract::State, http::StatusCode, response::IntoResponse};

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

    match is_valid_email(&body.email) {
        Ok(res) => {
            if !res {
                return ApiResponse::error("Not a valid email", StatusCode::BAD_REQUEST);
            }
        }
        Err(err) => {
            return ApiResponse::error(&err, StatusCode::INTERNAL_SERVER_ERROR);
        }
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
    let password_hash = match hash_password(&body.password) {
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

    let token_payload = JwtPayload {
        email: new_user.email.clone(),
        user_id: new_user.user_id.clone(),
    };

    // create jwt token
    let token = match sign(token_payload) {
        Ok(t) => t,
        Err(err) => {
            return ApiResponse::error(&err.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // return response
    return ApiResponse::success(json!({
        "user": new_user,
        "token": token
    }));
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
