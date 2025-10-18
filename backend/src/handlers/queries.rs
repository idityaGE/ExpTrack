use std::sync::Arc;

use axum::{
    Json,
    extract::{Path, State},
    response::IntoResponse,
};
use serde_json::json;

use crate::{
    AppState,
    schema::{ApiResponse, user::LoginUserSchema},
};

pub async fn get_all_expenses() -> impl IntoResponse {}

pub async fn get_expense_by_id() -> impl IntoResponse {}

pub async fn get_all_categories() -> impl IntoResponse {}

pub async fn get_all_budgets() -> impl IntoResponse {}

pub async fn get_budget_by_id() -> impl IntoResponse {}

pub async fn login_user(
    State(state): State<Arc<AppState>>,
    Json(body): Json<LoginUserSchema>,
    // Path(email): Path<String>,
) -> ApiResponse<serde_json::Value> {
    // validate email with regex

    // check if user exists

    // match password hash

    // create token
    
    // return response
    ApiResponse::success(json!( {
      "token": "boom"
    }))
}
