use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::json;

use crate::{
    AppState,
    models::user::UserModel,
    schema::{ApiResponse, user::LoginUserSchema},
    utils::{
        hash::verify_hash_password,
        jwt::{JwtPayload, sign},
        pattern::is_valid_email,
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
) -> ApiResponse<serde_json::Value> {
    // validate email with regex
    match is_valid_email(&email) {
        Ok(res) => {
            if !res {
                return ApiResponse::error("Provided email is not valid", StatusCode::BAD_REQUEST);
            }
        }
        Err(err) => {
            return ApiResponse::error(&err, StatusCode::INTERNAL_SERVER_ERROR);
        }
    }

    // check if user exists
    let user = match sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE email = $1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await
    {
        Ok(u) => match u {
            Some(data) => data,
            None => {
                return ApiResponse::error("User doesn't exits", StatusCode::CONFLICT);
            }
        },
        Err(err) => {
            return ApiResponse::error(&err.to_string(), StatusCode::INTERNAL_SERVER_ERROR);
        }
    };

    // match password hash
    match verify_hash_password(&body.password, &user.password_hash) {
        Ok(res) => {
            if !res {
                return ApiResponse::error(
                    "Password doesn't match, please check again",
                    StatusCode::UNAUTHORIZED,
                );
            }
        }
        Err(err) => return ApiResponse::error(err, StatusCode::INTERNAL_SERVER_ERROR),
    }

    let token_payload = JwtPayload {
        email: user.email.clone(),
        user_id: user.user_id.clone(),
    };

    // create token
    let token = match sign(token_payload) {
        Ok(token) => token,
        Err(err) => return ApiResponse::error(&err, StatusCode::INTERNAL_SERVER_ERROR),
    };

    // return response
    ApiResponse::success(json!( {
      "token": token,
      "user": user
    }))
}
