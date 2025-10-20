use std::sync::Arc;

use axum::{
    Extension, Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde_json::json;
use uuid::Uuid;

use crate::{
    AppState,
    models::{BudgetModel, CategoryModel, ExpenseModel},
    ok_or_err,
    schema::{ApiResponse, ApiResult, LoginUserSchema},
    utils::{
        helper::{get_user_by_email, validate_email},
        sign, verify_hash_password,
    },
};

pub async fn get_all_expenses(
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    let all_expenses = sqlx::query_as::<_, ExpenseModel>(
        "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC",
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(ApiResponse::success(json!({
        "expenses": all_expenses
    })))
}

pub async fn get_expense_by_id(
    Path(id): Path<String>,
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    let expense_id = Uuid::parse_str(&id)
        .map_err(|_| ApiResponse::error("Invalid expense ID format", StatusCode::BAD_REQUEST))?;

    let expense = sqlx::query_as::<_, ExpenseModel>(
        "SELECT * FROM expenses WHERE expense_id = $1 AND user_id = $2",
    )
    .bind(expense_id)
    .bind(user_id)
    .fetch_optional(&state.db)
    .await?;

    match expense {
        Some(expense) => Ok(ApiResponse::success(json!({
            "expense": expense
        }))),
        None => Err(ApiResponse::error(
            "Expense not found",
            StatusCode::NOT_FOUND,
        )),
    }
}

pub async fn get_all_categories(
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    let all_categories = sqlx::query_as::<_, CategoryModel>(
        "SELECT * FROM categories WHERE user_id = $1 OR user_id IS NULL",
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(ApiResponse::success(json!({
        "categories": all_categories
    })))
}

pub async fn get_all_budgets(
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    let all_budgets = sqlx::query_as::<_, BudgetModel>(
        "SELECT * FROM budgets WHERE user_id = $1 ORDER BY start_date DESC",
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await?;

    Ok(ApiResponse::success(json!({
        "budgets": all_budgets
    })))
}

pub async fn get_budget_by_id(
    Path(id): Path<String>,
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    let budget_id = Uuid::parse_str(&id)
        .map_err(|_| ApiResponse::error("Invalid budget ID format", StatusCode::BAD_REQUEST))?;

    let budget = sqlx::query_as::<_, BudgetModel>(
        "SELECT * FROM budgets WHERE budget_id = $1 AND user_id = $2",
    )
    .bind(budget_id)
    .bind(user_id)
    .fetch_optional(&state.db)
    .await?;

    match budget {
        Some(budget) => Ok(ApiResponse::success(json!({
            "budget": budget
        }))),
        None => Err(ApiResponse::error(
            "Budget not found",
            StatusCode::NOT_FOUND,
        )),
    }
}

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

    Ok(ApiResponse::success(json!({
        "token": token,
        "user": user
    })))
}
